# MyShop Admin Portal: System, Database & Frontend Optimization Guide

**System:** Vangard Technology Admin Platform  
**Target:** Next.js (App Router), Supabase (PostgreSQL), TanStack Table, shadcn/ui  
**Primary Objectives:** Zero Client Auth Waterfalls, Minimal Supabase Egress, Low Postgres Memory Pressure, Sub-100ms Page Transitions

---

## 1. Authentication & Security Architecture

### 1.1 The Anti-Pattern: Client-Side `AuthContext`
Using a React Context provider (`AuthContext`) at the client root creates significant performance and security issues:
* **The Render Waterfall:** Browser downloads HTML $\rightarrow$ downloads JS bundle $\rightarrow$ executes React $\rightarrow$ mounts `useEffect` $\rightarrow$ fires Supabase auth HTTP request $\rightarrow$ renders spinner $\rightarrow$ redirects unauthenticated traffic.
* **Bundle Leakage:** Exposes administrative route code, schema property names, and UI components to unauthorized visitors inspecting client bundles.

### 1.2 The Production Pattern: Server-Side Middleware Interception
Enforce authorization at the edge / server level before any component begins rendering.

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Guard all /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const isPlatformAdmin = user?.app_metadata?.role === "platform_admin";

    if (!user || !isPlatformAdmin) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

---

## 2. Database & Egress Optimization (Supabase / Postgres)

Supabase billing and performance bottlenecks are primarily driven by **Bandwidth Egress** and **Disk I/O / RAM Consumption (`shared_buffers`, `work_mem`)**.

### 2.1 Explicit Column Projection (Ban `SELECT *`)
* **Bad:** `supabase.from("stores").select("*")` transfers internal configuration JSONs, audit trails, and unnecessary foreign keys across the network.
* **Good:** Request only the columns directly rendered in the table view.

```typescript
// Fetch only the 5 columns rendered in the grid
const { data, count } = await supabase
  .from("stores")
  .select("id, name, subscription_tier, province, created_at", { count: "estimated" })
  .range(from, to);
```

### 2.2 Database-Engine Computations via RPC (Zero Data Bleed)
Never load raw transaction rows into Node.js memory to compute metrics via `.reduce()`. A 10,000-row order dataset transfers ~2MB to 5MB of egress over HTTP. Running aggregation in PostgreSQL transfers less than 100 bytes.

#### PostgreSQL Function Migration:
```sql
CREATE OR REPLACE FUNCTION get_platform_telemetry()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_gmv', COALESCE(SUM(total_amount), 0),
    'total_orders', COUNT(id),
    'avg_order_value', COALESCE(ROUND(AVG(total_amount), 2), 0),
    'active_merchants_30d', COUNT(DISTINCT store_id)
  )
  INTO result
  FROM orders
  WHERE created_at >= NOW() - INTERVAL '30 days';

  RETURN result;
END;
$$;
```

#### Node.js Server Action Invocation:
```typescript
// app/actions/telemetry.ts
"use server";

import { myShopAdmin } from "@/lib/supabaseClients";

export async function fetchPlatformMetrics() {
  const { data, error } = await myShopAdmin.rpc("get_platform_telemetry");
  if (error) throw new Error(error.message);
  return data; // Payload: ~85 bytes total egress
}
```

### 2.3 Eliminating Full-Table Scans on Pagination
* **Avoid `count: 'exact'` on High-Volume Tables:** Exact counting forces Postgres to sequentially read the whole index or table heap to evaluate row visibility for MVCC.
* **Adopt Estimated Counts or Infinite Cursors:** Use `{ count: 'estimated' }` for large audit tables or cursor-based pagination (`.gt("id", lastSeenId)`).

### 2.4 Compound Indexes for Filtering Dimensions
Admin tables commonly execute multi-conditional sorting (e.g., `WHERE province = 'Cebu' AND subscription_tier = 'MICRO' ORDER BY created_at DESC`). Without an index matching the column order, Postgres sorts in memory (`work_mem`), exhausting server RAM.

```sql
-- Compound index optimizing combined filtering and sort operations
CREATE INDEX idx_stores_province_tier_created 
ON stores (province, subscription_tier, created_at DESC);

-- Index optimizing phone and name partial searches
CREATE INDEX idx_stores_name_trgm ON stores USING gin (name gin_trgm_ops);
```

### 2.5 Connection Pool Routing
All serverless functions, Server Actions, and Next.js route handlers must connect via **Supavisor Transaction Mode** (`port: 6543`) rather than the direct session port (`5432`). This reuses PostgreSQL connections and prevents connection pool exhaustion when multiple admins query the dashboard.

---

## 3. Front-End & Network Optimization

### 3.1 Strict Server Component vs. Client Component Boundaries
* **Server Components (Default):** The base page shell, table structure, and initial data fetch run entirely on the server. Zero TanStack or UI library footprint is shipped to the client.
* **Client Components (`"use client"`):** Isolated strictly to interactive leaves (e.g., Search Input, Status Toggle, Action Dialog).

```text
app/(admin)/merchants/page.tsx (Server Component - 0 KB Client JS)
├── MerchantsHeader.tsx (Server Component)
├── MerchantsFilters.tsx ("use client" - Search input, Tier select)
└── MerchantsTable.tsx (Server Component shell)
    └── MerchantRowActions.tsx ("use client" - Dropdown menu only)
```

### 3.2 URL State Synchronization & Search Debouncing
Bind all filter states to search parameters using `nuqs`. Never store table filter state exclusively in local `useState`.

```typescript
// components/admin/MerchantsFilters.tsx
"use client";

import { useQueryState } from "nuqs";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";

export function MerchantsFilters() {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
    shallow: false, // Triggers server component re-fetch
    throttleMs: 400, // Debounce keystrokes to prevent database flooding
  });

  return (
    <Input
      placeholder="Search by store or owner..."
      value={search}
      onChange={(e) => {
        startTransition(() => {
          setSearch(e.target.value || null);
        });
      }}
      className={isPending ? "opacity-60" : "opacity-100"}
    />
  );
}
```

### 3.3 DOM Virtualization for Large Datasets
If an admin views more than 100 records on a single page, rendering plain HTML table rows causes significant memory consumption and scroll frame drops.

* **Standard Rendering:** 100 rows $\times$ 8 columns = 800 complex DOM nodes held in memory.
* **Virtual Rendering (`@tanstack/react-virtual`):** Only mounts the 12–15 rows currently visible within the viewport scroll box, recycling DOM elements continuously.

---

## 4. End-to-End Implementation Blueprint

### 4.1 Server Component Data Table View
```tsx
// app/(admin)/merchants/page.tsx
import { myShopAdmin } from "@/lib/supabaseClients";
import { MerchantsTable } from "@/components/admin/MerchantsTable";
import { MerchantsFilters } from "@/components/admin/MerchantsFilters";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    tier?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 25;

export default async function MerchantsPage({ searchParams }: PageProps) {
  const { q, tier, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Build query targeting ONLY visible columns
  let query = myShopAdmin
    .from("stores")
    .select("id, name, subscription_tier, province, created_at, status", {
      count: "estimated",
    })
    .range(from, to)
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }
  if (tier && tier !== "ALL") {
    query = query.eq("subscription_tier", tier);
  }

  const { data: stores, count } = await query;

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Merchant Governance
        </h1>
        <p className="text-sm text-slate-500">
          Manage and monitor registered Philippine MSME stores.
        </p>
      </div>

      <MerchantsFilters />

      <MerchantsTable 
        data={stores ?? []} 
        totalCount={count ?? 0} 
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
      />
    </div>
  );
}
```

---

## 5. Architectural Checklist for Code Reviews

| Review Dimension | Violation Rule | Approved Standard |
| :--- | :--- | :--- |
| **Auth Verification** | Client-side `useEffect` or context checking login state. | Intercepted in `middleware.ts` + root layout via `@supabase/ssr`. |
| **Column Projection** | Any query executing `.select("*")`. | Explicit column projections matching UI fields only. |
| **Aggregations** | `.map()` or `.reduce()` computing totals in Node.js. | Executed directly in PostgreSQL via `RPC` or database `Views`. |
| **Pagination** | Fetching all records and slicing array in JavaScript. | Range-based queries (`.range(start, end)`) synced to URL params. |
| **Search Input** | Firing Supabase query on every keystroke (`onChange`). | Debounced by 300ms–400ms using `nuqs` or transition hooks. |
| **Client Bundles** | Adding `"use client"` to the top-level route component. | Route remains a Server Component; `"use client"` pushed to leaves. |
| **Connection Mode** | Connecting to Supabase port `5432` directly. | Route through Supavisor transaction pooler on port `6543`. |