"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Award,
  Plus,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Gift,
  Store,
  SlidersHorizontal,
  Smartphone,
  ShieldCheck,
  Calendar,
  X,
  CreditCard,
  Building,
  Sparkles,
  Zap,
  ArrowUpRight,
  RotateCcw,
  Check,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ====================================================================
// TYPES & TIER DATA STRUCTURES (Aligned with schema.sql)
// ====================================================================

export type PlanTier = "free" | "micro" | "small" | "medium";
export type SubscriptionStatus = "Active" | "Grace Period" | "Upgrade Requested" | "Granted" | "Canceled";
export type GrantType = "admin_grant" | "promo_free" | "vip_complimentary" | "trial";

export interface PlanTierSpec {
  id: PlanTier;
  name: string;
  pricePHP: number;
  billingInterval: "monthly";
  maxBranches: number;
  maxDevices: number;
  maxProducts: string;
  activeMerchants: number;
  badgeClass: string;
  description: string;
  features: string[];
}

export interface MerchantTierAllocation {
  id: string; // SUB-ALLOC-XXXX
  merchantName: string;
  contactEmail: string;
  contactPhone: string;
  storeName: string;
  branch: string;
  currentTier: PlanTier;
  billingInterval: "monthly" | "annual";
  price: number;
  status: SubscriptionStatus;
  maxBranches: number;
  maxDevices: number;
  currentDevicesActive: number;
  validUntil: string;
  paymentGateway: "PayMongo" | "GCash" | "Maya" | "Card" | "Admin_Grant" | "Free Tier" | string;
  paymentMethod: string;
  grantType?: GrantType;
  adminNotes?: string;
}

// 4 Official Tiers from schema.sql
export const PLAN_TIER_SPECS: PlanTierSpec[] = [
  {
    id: "free",
    name: "Free Tier",
    pricePHP: 0,
    billingInterval: "monthly",
    maxBranches: 1,
    maxDevices: 1,
    maxProducts: "100 Items",
    activeMerchants: 1420,
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
    description: "Starter POS for micro sari-sari stalls and home entrepreneurs.",
    features: ["1 Mobile Device", "1 Branch", "Standard Receipts", "Community Support"],
  },
  {
    id: "micro",
    name: "Micro Tier",
    pricePHP: 99,
    billingInterval: "monthly",
    maxBranches: 1,
    maxDevices: 1,
    maxProducts: "1,000 Items",
    activeMerchants: 3850,
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Ideal for neighborhood grocers, bakeries, and single-store retailers.",
    features: ["1 Mobile Device", "1 Branch", "Inventory Tracking", "Utang Credit Ledger"],
  },
  {
    id: "small",
    name: "Small Tier",
    pricePHP: 499,
    billingInterval: "monthly",
    maxBranches: 1,
    maxDevices: 3,
    maxProducts: "Unlimited",
    activeMerchants: 2180,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Multi-device checkout for bustling pharmacies, hardware stores, and mini-marts.",
    features: ["Up to 3 Devices", "1 Branch", "Staff Role Permissions", "End-of-Day SMS Telephony"],
  },
  {
    id: "medium",
    name: "Medium Tier",
    pricePHP: 1499,
    billingInterval: "monthly",
    maxBranches: 5,
    maxDevices: 999,
    maxProducts: "Unlimited",
    activeMerchants: 840,
    badgeClass: "bg-[#D63C1E]/10 text-[#D63C1E] border-[#D63C1E]/30",
    description: "Multi-branch franchise operations with centralized catalog governance.",
    features: ["5 Store Branches", "Unlimited Devices", "Centralized Stock Sync", "VIP Priority SLA"],
  },
];

// Initial Merchant Allocations Data
const INITIAL_ALLOCATIONS: MerchantTierAllocation[] = [
  {
    id: "ALLOC-901",
    merchantName: "Mateo Valenzuela",
    contactEmail: "mateo@kapeisla.ph",
    contactPhone: "+63 917 555 8821",
    storeName: "Kape Isla Specialty Coffee",
    branch: "Makati Flagship",
    currentTier: "medium",
    billingInterval: "monthly",
    price: 1499,
    status: "Active",
    maxBranches: 5,
    maxDevices: 999,
    currentDevicesActive: 4,
    validUntil: "Nov 24, 2024",
    paymentGateway: "PayMongo",
    paymentMethod: "Credit Card (Visa •••• 8821)",
  },
  {
    id: "ALLOC-902",
    merchantName: "Clarisse Tan",
    contactEmail: "ctan@dailymart.com",
    contactPhone: "+63 928 555 1904",
    storeName: "Daily Mart Convenience",
    branch: "BGC High Street",
    currentTier: "small",
    billingInterval: "monthly",
    price: 499,
    status: "Active",
    maxBranches: 1,
    maxDevices: 3,
    currentDevicesActive: 2,
    validUntil: "Nov 15, 2024",
    paymentGateway: "GCash",
    paymentMethod: "GCash e-Wallet (+63 928 555 1904)",
  },
  {
    id: "ALLOC-903",
    merchantName: "Ramon Joaquin Sy",
    contactEmail: "sy.ramon@zenithgadgets.ph",
    contactPhone: "+63 918 555 7712",
    storeName: "Zenith Mobile & Gadgets",
    branch: "Ortigas Cyber Mall",
    currentTier: "medium",
    billingInterval: "annual",
    price: 14990,
    status: "Active",
    maxBranches: 5,
    maxDevices: 999,
    currentDevicesActive: 3,
    validUntil: "Jan 10, 2025",
    paymentGateway: "PayMongo",
    paymentMethod: "Credit Card (Mastercard •••• 7712)",
  },
  {
    id: "ALLOC-904",
    merchantName: "Lourdes Del Rosario",
    contactEmail: "lourdes@sunrisebakes.ph",
    contactPhone: "+63 908 555 3341",
    storeName: "Sunrise Bakeshop",
    branch: "Pasig Market Outlet",
    currentTier: "micro",
    billingInterval: "monthly",
    price: 99,
    status: "Active",
    maxBranches: 1,
    maxDevices: 1,
    currentDevicesActive: 1,
    validUntil: "Nov 02, 2024",
    paymentGateway: "Maya",
    paymentMethod: "Maya Wallet (+63 908 555 3341)",
  },
  {
    id: "ALLOC-905",
    merchantName: "Francis Kenji Lim",
    contactEmail: "kenji@urbanthreads.store",
    contactPhone: "+63 939 555 6091",
    storeName: "Urban Threads Apparel",
    branch: "Cebu South Reclamation",
    currentTier: "small",
    billingInterval: "monthly",
    price: 499,
    status: "Upgrade Requested",
    maxBranches: 1,
    maxDevices: 3,
    currentDevicesActive: 3,
    validUntil: "Oct 28, 2024",
    paymentGateway: "PayMongo",
    paymentMethod: "GCash via PayMongo",
  },
  {
    id: "ALLOC-906",
    merchantName: "Bernadette Santos",
    contactEmail: "berna@quickbite.com.ph",
    contactPhone: "+63 919 555 4420",
    storeName: "Quick Bite Canteen",
    branch: "Quezon City Hub",
    currentTier: "free",
    billingInterval: "monthly",
    price: 0,
    status: "Active",
    maxBranches: 1,
    maxDevices: 1,
    currentDevicesActive: 1,
    validUntil: "Permanent Free",
    paymentGateway: "Free Tier",
    paymentMethod: "Standard Free POS (₱0.00)",
  },
  {
    id: "ALLOC-907",
    merchantName: "Hannah Grace Alcantara",
    contactEmail: "hannah@luminaspa.ph",
    contactPhone: "+63 922 555 0192",
    storeName: "Lumina Wellness & Spa",
    branch: "Alabang Town Center",
    currentTier: "micro",
    billingInterval: "monthly",
    price: 0,
    status: "Granted",
    maxBranches: 1,
    maxDevices: 1,
    currentDevicesActive: 1,
    validUntil: "Dec 31, 2024",
    paymentGateway: "Admin_Grant",
    paymentMethod: "Promotional Partner Subsidy (₱0.00)",
    grantType: "promo_free",
    adminNotes: "Onboarding partner campaign subsidy.",
  },
  {
    id: "ALLOC-908",
    merchantName: "Enrique Gabriel Co",
    contactEmail: "eco@freshharvest.ph",
    contactPhone: "+63 927 555 6672",
    storeName: "Fresh Harvest Agri Supply",
    branch: "Davao City Branch",
    currentTier: "medium",
    billingInterval: "monthly",
    price: 1499,
    status: "Grace Period",
    maxBranches: 5,
    maxDevices: 999,
    currentDevicesActive: 4,
    validUntil: "Oct 26, 2024",
    paymentGateway: "PayMongo",
    paymentMethod: "Credit Card (Visa •••• 6672)",
  },
];

// Dropdown Cards: Tier Filter
export const TIER_CARD_OPTIONS = [
  {
    value: "all",
    label: "All Tiers",
    desc: "Display subscribers across Free, Micro, Small and Medium plans",
    badge: "8,290 Stores",
  },
  {
    value: "free",
    label: "Free Tier",
    desc: "₱0/mo • 1 Branch • 1 Device",
    badge: "1,420 Stores",
  },
  {
    value: "micro",
    label: "Micro Tier",
    desc: "₱99/mo • 1 Branch • 1 Device",
    badge: "3,850 Stores",
  },
  {
    value: "small",
    label: "Small Tier",
    desc: "₱499/mo • 1 Branch • 3 Devices",
    badge: "2,180 Stores",
  },
  {
    value: "medium",
    label: "Medium Tier",
    desc: "₱1,499/mo • 5 Branches • Unlimited",
    badge: "840 Stores",
  },
];

// Dropdown Cards: Status Filter
export const STATUS_CARD_OPTIONS = [
  {
    value: "all",
    label: "All Statuses",
    desc: "Active, Granted promos, and Grace Period renewals",
  },
  {
    value: "Active",
    label: "Active Plan",
    desc: "Regular monthly recurring billing active via PayMongo/Wallet",
  },
  {
    value: "Granted",
    label: "Admin Granted",
    desc: "Subsidized partner promotional access with zero PHP charge",
  },
  {
    value: "Grace Period",
    label: "Grace Period",
    desc: "Retrying failed subscription charge before automated downgrade",
  },
  {
    value: "Upgrade Requested",
    label: "Upgrade Requested",
    desc: "Store exceeded current terminal limit and requested higher tier",
  },
];

// Helper to format currency
const formatPHP = (val: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(val);
};

export default function TierManagementPage() {
  // Mobile navigation
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Data
  const [allocations, setAllocations] = useState<MerchantTierAllocation[]>(INITIAL_ALLOCATIONS);

  // Side Modal States (STRICT RULE: All tables must have side modal only)
  const [selectedAllocation, setSelectedAllocation] = useState<MerchantTierAllocation | null>(null);
  const [grantSubModalOpen, setGrantSubModalOpen] = useState(false);

  // Grant Subscription Form State
  const [grantMerchantName, setGrantMerchantName] = useState("");
  const [grantMerchantEmail, setGrantMerchantEmail] = useState("");
  const [grantMerchantPhone, setGrantMerchantPhone] = useState("");
  const [grantStoreName, setGrantStoreName] = useState("");
  const [grantBranch, setGrantBranch] = useState("");
  const [grantTier, setGrantTier] = useState<PlanTier>("small");
  const [grantType, setGrantType] = useState<GrantType>("admin_grant");
  const [grantDuration, setGrantDuration] = useState<string>("30 Days");
  const [grantAdminNotes, setGrantAdminNotes] = useState("");

  // Email auto-suggest state for Grant Subscription
  const [emailSearchFocus, setEmailSearchFocus] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<MerchantTierAllocation | null>(null);

  const emailSuggestions = useMemo(() => {
    if (!grantMerchantEmail.trim()) {
      return allocations.slice(0, 6);
    }
    const query = grantMerchantEmail.toLowerCase().trim();
    return allocations.filter(
      (a) =>
        a.contactEmail.toLowerCase().includes(query) ||
        a.merchantName.toLowerCase().includes(query) ||
        a.storeName.toLowerCase().includes(query)
    );
  }, [allocations, grantMerchantEmail]);

  const handleSelectEmailSuggestion = (sub: MerchantTierAllocation) => {
    setGrantMerchantEmail(sub.contactEmail);
    setGrantMerchantName(sub.merchantName);
    setGrantStoreName(sub.storeName);
    setGrantBranch(sub.branch);
    setGrantMerchantPhone(sub.contactPhone);
    setSelectedSubscriber(sub);
    setEmailSearchFocus(false);
  };

  // Lock body scroll when any side modal is open
  useEffect(() => {
    const isModalOpen = selectedAllocation !== null || grantSubModalOpen;
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedAllocation, grantSubModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedAllocation(null);
        setGrantSubModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered allocations
  const filteredAllocations = useMemo(() => {
    return allocations.filter((item) => {
      const matchesSearch =
        item.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier = tierFilter === "all" || item.currentTier === tierFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [allocations, searchQuery, tierFilter, statusFilter]);

  // Paginated allocations
  const paginatedAllocations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAllocations.slice(start, start + itemsPerPage);
  }, [filteredAllocations, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredAllocations.length / itemsPerPage));

  // Change Tier handler in Inspect Side Modal
  const handleChangeTier = (allocation: MerchantTierAllocation, newTier: PlanTier) => {
    const spec = PLAN_TIER_SPECS.find((s) => s.id === newTier)!;
    const updated: MerchantTierAllocation = {
      ...allocation,
      currentTier: newTier,
      price: spec.pricePHP,
      maxBranches: spec.maxBranches,
      maxDevices: spec.maxDevices,
      status: "Active",
      adminNotes: `Tier changed to ${spec.name} by Super Admin.`,
    };

    setAllocations((prev) => prev.map((a) => (a.id === allocation.id ? updated : a)));
    setSelectedAllocation(updated);

    toast.success("Merchant Tier Updated", {
      description: `${allocation.storeName} upgraded to ${spec.name} (Max Devices: ${spec.maxDevices}).`,
    });
  };

  // Submit Grant Subscription
  const handleGrantSubscriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantMerchantEmail.trim()) {
      toast.error("Email Required", {
        description: "Please search and select a subscriber email.",
      });
      return;
    }

    const spec = PLAN_TIER_SPECS.find((s) => s.id === grantTier)!;
    const resolvedName =
      grantMerchantName.trim() ||
      grantMerchantEmail
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    const resolvedStore = grantStoreName.trim() || `${resolvedName}'s Store`;
    const resolvedBranch = grantBranch.trim() || "Main Branch";
    const resolvedPhone = grantMerchantPhone.trim() || "+63 900 000 0000";

    const newGrant: MerchantTierAllocation = {
      id: `ALLOC-GRANT-${Math.floor(100 + Math.random() * 900)}`,
      merchantName: resolvedName,
      contactEmail: grantMerchantEmail.trim(),
      contactPhone: resolvedPhone,
      storeName: resolvedStore,
      branch: resolvedBranch,
      currentTier: grantTier,
      billingInterval: "monthly",
      price: 0,
      status: "Granted",
      maxBranches: spec.maxBranches,
      maxDevices: spec.maxDevices,
      currentDevicesActive: 1,
      validUntil: `Granted (${grantDuration})`,
      paymentGateway: "Admin_Grant",
      paymentMethod: "Promotional Waiver (₱0.00)",
      grantType: grantType,
      adminNotes: grantAdminNotes || `Complimentary access granted for ${grantDuration}.`,
    };

    setAllocations([newGrant, ...allocations]);
    setGrantSubModalOpen(false);
    setSelectedAllocation(newGrant);

    // Reset form
    setGrantMerchantName("");
    setGrantMerchantEmail("");
    setGrantMerchantPhone("");
    setGrantStoreName("");
    setGrantBranch("");
    setGrantTier("small");
    setGrantType("admin_grant");
    setGrantDuration("30 Days");
    setGrantAdminNotes("");
    setEmailSearchFocus(false);
    setSelectedSubscriber(null);

    toast.success("Subscription Granted Successfully", {
      description: `${newGrant.merchantName} (${newGrant.contactEmail}) now active on ${spec.name} with ₱0 billing.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] font-sans antialiased selection:bg-[#D63C1E] selection:text-white">
      {/* Sidebar Navigation */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <AdminHeader
          title="Tier Management"
          onOpenMobile={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 pt-20 px-4 sm:px-6 md:px-8 pb-12 max-w-[1600px] w-full mx-auto">
          {/* Header & Quick Action Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                Tier Management
              </h1>
              <p className="text-xs sm:text-sm text-[#757575] mt-1">
                Oversee SaaS subscription allocations, device constraints, and partner promotional grants.
              </p>
            </div>

            {/* Grant Subscription Primary CTA */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setGrantSubModalOpen(true)}
                className="h-11 px-5 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Grant Subscription</span>
              </button>
            </div>
          </div>

          {/* KPI Cards: 4 Tier Cards (Stitch Neo-Fintech Canvas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {PLAN_TIER_SPECS.map((spec) => (
              <div
                key={spec.id}
                className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#757575] block">
                      Plan Level
                    </span>
                    <h3 className="text-base font-bold text-[#1A1A1A] mt-0.5">{spec.name}</h3>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#565F6D] group-hover:scale-105 transition-transform">
                    {spec.id === "free" && <Store className="w-4 h-4" />}
                    {spec.id === "micro" && <Smartphone className="w-4 h-4 text-blue-600" />}
                    {spec.id === "small" && <Building className="w-4 h-4 text-amber-600" />}
                    {spec.id === "medium" && <Award className="w-4 h-4 text-[#D63C1E]" />}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#1A1A1A]">
                      {spec.activeMerchants.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#757575]">Stores</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F5F5F5]">
                    <span className="font-bold text-[#1A1A1A]">
                      {formatPHP(spec.pricePHP)} <span className="text-[#757575] font-normal">/ mo</span>
                    </span>
                    <span className="text-[11px] text-[#757575]">
                      {spec.maxDevices === 999 ? "Unlimited POS" : `${spec.maxDevices} Terminal`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Clean Filter Toolbar with Card Dropdowns */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Customer Tier Allocations</h2>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search input */}
              <div className="relative min-w-[260px]">
                <Search className="w-3.5 h-3.5 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search merchant, store, or ID..."
                  className="w-full h-10 pl-9 pr-4 rounded-full bg-white border border-[#EAEAEA] text-xs text-[#1A1A1A] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#D63C1E] shadow-xs transition-all"
                />
              </div>

              {/* Tier Filter Dropdown Cards */}
              <DropdownMenu>
                <DropdownMenuTrigger className="h-10 px-4 rounded-full bg-white border border-[#EAEAEA] text-xs font-medium text-[#1A1A1A] flex items-center gap-2 shadow-xs hover:bg-[#F9F9F9] cursor-pointer transition-all">
                  <Filter className="w-3.5 h-3.5 text-[#757575]" />
                  <span>
                    Tier: <strong className="text-[#1A1A1A] capitalize">{tierFilter}</strong>
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#757575]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 rounded-2xl p-2 bg-white shadow-xl border border-[#EAEAEA] z-50 space-y-1"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                    Filter By Plan Tier
                  </div>
                  {TIER_CARD_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => {
                        setTierFilter(opt.value);
                        setCurrentPage(1);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                        tierFilter === opt.value
                          ? "bg-[#D63C1E]/5 border border-[#D63C1E]/20"
                          : "hover:bg-[#F5F5F5] border border-transparent"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#1A1A1A]">{opt.label}</span>
                          {tierFilter === opt.value && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D63C1E]" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#757575] leading-snug mt-0.5">{opt.desc}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Status Filter Dropdown Cards */}
              <DropdownMenu>
                <DropdownMenuTrigger className="h-10 px-4 rounded-full bg-white border border-[#EAEAEA] text-xs font-medium text-[#1A1A1A] flex items-center gap-2 shadow-xs hover:bg-[#F9F9F9] cursor-pointer transition-all">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#757575]" />
                  <span>
                    Status: <strong className="text-[#1A1A1A]">{statusFilter}</strong>
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#757575]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 rounded-2xl p-2 bg-white shadow-xl border border-[#EAEAEA] z-50 space-y-1"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                    Filter By Status
                  </div>
                  {STATUS_CARD_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setCurrentPage(1);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                        statusFilter === opt.value
                          ? "bg-[#D63C1E]/5 border border-[#D63C1E]/20"
                          : "hover:bg-[#F5F5F5] border border-transparent"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#1A1A1A]">{opt.label}</span>
                          {statusFilter === opt.value && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D63C1E]" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#757575] leading-snug mt-0.5">{opt.desc}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ========================================================
              CUSTOMER TIER ALLOCATIONS TABLE (Clean Columns)
             ======================================================== */}
          <div className="bg-white rounded-3xl border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F0F0F0] text-[#757575] text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6">Store Owner</th>
                    <th className="py-3.5 px-4">Store & Branch</th>
                    <th className="py-3.5 px-4 text-center">Current Tier</th>
                    <th className="py-3.5 px-4 text-right">Subscription Price</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F7F7]">
                  {paginatedAllocations.length > 0 ? (
                    paginatedAllocations.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedAllocation(item)}
                        className="hover:bg-[#F9F9F9] transition-colors group cursor-pointer"
                      >
                        {/* Clean Store Owner (No email/phone clutter in table cell) */}
                        <td className="py-4 px-6 text-xs font-bold text-[#1A1A1A] whitespace-nowrap">
                          {item.merchantName}
                        </td>

                        {/* Store & Branch */}
                        <td className="py-4 px-4 text-xs font-semibold text-[#1A1A1A] whitespace-nowrap">
                          <span>{item.storeName}</span>
                          <span className="text-[11px] text-[#757575] font-normal block">{item.branch}</span>
                        </td>

                        {/* Current Tier Pill */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold capitalize border ${
                              item.currentTier === "medium"
                                ? "bg-[#D63C1E]/10 text-[#D63C1E] border-[#D63C1E]/30"
                                : item.currentTier === "small"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : item.currentTier === "micro"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {item.currentTier} Tier
                          </span>
                        </td>

                        {/* Subscription Price */}
                        <td className="py-4 px-4 text-xs font-bold text-right text-[#1A1A1A] whitespace-nowrap">
                          {item.price === 0 ? (
                            <span className="text-emerald-600">₱0.00 (Granted)</span>
                          ) : (
                            formatPHP(item.price)
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              item.status === "Active"
                                ? "bg-emerald-50 text-emerald-700"
                                : item.status === "Granted"
                                ? "bg-purple-50 text-purple-700"
                                : item.status === "Upgrade Requested"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {item.status}
                          </span>
                        </td>

                        {/* Pure Chevron Action Button */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAllocation(item);
                            }}
                            className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] transition-all cursor-pointer"
                            title="Manage Tier Allocation"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-[#757575]">
                        No merchant tier allocations match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Footer */}
            <div className="py-4 px-6 border-t border-[#F5F5F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#757575]">
              <div>
                Showing <span className="font-semibold text-[#1A1A1A]">{paginatedAllocations.length}</span> of{" "}
                <span className="font-semibold text-[#1A1A1A]">{filteredAllocations.length}</span> merchants
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#757575] hover:bg-[#F0F0F0] hover:text-[#1A1A1A] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-[#D63C1E] text-white shadow-xs"
                        : "text-[#757575] hover:bg-[#F0F0F0] hover:text-[#1A1A1A]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#757575] hover:bg-[#F0F0F0] hover:text-[#1A1A1A] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================
          SIDE MODAL 1: MERCHANT TIER ALLOCATION (SLIDES FROM RIGHT)
         ======================================================== */}
      <AnimatePresence>
        {selectedAllocation && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedAllocation(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Slide-out Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="w-screen max-w-lg bg-white shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#EAEAEA] flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#D63C1E]/10 flex items-center justify-center text-[#D63C1E]">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1A1A]">{selectedAllocation.id}</h3>
                      <p className="text-xs text-[#757575]">Plan Allocation & Payment Details</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAllocation(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#757575] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#757575] block">Current Plan Tier</span>
                      <span className="font-extrabold text-sm text-[#1A1A1A] capitalize mt-0.5 block">
                        {selectedAllocation.currentTier} Tier
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#757575] block">Subscription Status</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                          selectedAllocation.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : selectedAllocation.status === "Granted"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {selectedAllocation.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#757575] block">Renewal / Valid</span>
                      <span className="font-semibold text-[#1A1A1A] block mt-1">{selectedAllocation.validUntil}</span>
                    </div>
                  </div>

                  {/* Merchant Subscriber Profile (Strictly Name & Contact Info) */}
                  <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] space-y-2.5">
                    <div className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider text-[#757575]">
                      Merchant Subscriber Profile
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                      <span className="text-[#757575]">Full Name:</span>
                      <span className="font-bold text-[#1A1A1A]">{selectedAllocation.merchantName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                      <span className="text-[#757575]">Contact Phone:</span>
                      <span className="font-semibold text-[#1A1A1A]">{selectedAllocation.contactPhone}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#757575]">Contact Email:</span>
                      <span className="font-semibold text-[#1A1A1A]">{selectedAllocation.contactEmail}</span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] space-y-2.5">
                    <div className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider text-[#757575]">
                      Payment Details
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                      <span className="text-[#757575]">Payment Gateway:</span>
                      <span className="font-bold text-[#1A1A1A]">
                        {selectedAllocation.paymentGateway === "Admin_Grant"
                          ? "Admin Grant"
                          : selectedAllocation.paymentGateway}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#757575]">Payment Method:</span>
                      <span className="font-semibold text-[#1A1A1A]">{selectedAllocation.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Admin Notes / Grant Reason */}
                  {selectedAllocation.adminNotes && (
                    <div className="space-y-1.5">
                      <span className="font-semibold text-[#1A1A1A] block">Administrative Memo:</span>
                      <p className="text-black font-medium leading-relaxed p-3.5 rounded-xl border border-[#EAEAEA]">
                        {selectedAllocation.adminNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Controls: Change Tier Dropdown Card */}
                <div className="p-5 border-t border-[#EAEAEA] bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Change Tier Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-10 px-4 rounded-full border border-[#EAEAEA] bg-white text-xs font-semibold text-[#1A1A1A] hover:bg-[#F9F9F9] flex items-center gap-2 cursor-pointer shadow-xs transition-all">
                      <Zap className="w-3.5 h-3.5 text-[#D63C1E]" />
                      <span>
                        Change Tier: <strong className="capitalize">{selectedAllocation.currentTier}</strong>
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#757575]" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-80 rounded-2xl p-2 bg-white shadow-xl border border-[#EAEAEA] z-50 space-y-1.5"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                        Select New Subscription Plan
                      </div>
                      {PLAN_TIER_SPECS.map((spec) => (
                        <DropdownMenuItem
                          key={spec.id}
                          onClick={() => handleChangeTier(selectedAllocation, spec.id)}
                          className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 border ${
                            selectedAllocation.currentTier === spec.id
                              ? "bg-[#D63C1E]/5 border-[#D63C1E]/30"
                              : "hover:bg-[#F5F5F5] border-transparent"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#1A1A1A]">{spec.name}</span>
                              <span className="font-semibold text-xs text-[#D63C1E]">
                                {formatPHP(spec.pricePHP)}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#757575] leading-snug mt-0.5">{spec.description}</p>
                            <div className="text-[10px] font-medium text-[#565F6D] mt-1">
                              {spec.maxBranches} Branch • {spec.maxDevices === 999 ? "Unlimited" : spec.maxDevices}{" "}
                              POS Terminal(s)
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Extend Subscription Button */}
                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Validity Extended", {
                        description: `Added 30 days validity to ${selectedAllocation.storeName}.`,
                      });
                    }}
                    className="h-10 px-5 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Extend 30 Days</span>
                  </button>
                </div>
              </motion.aside>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          SIDE MODAL 2: GRANT SUBSCRIPTION (SLIDES FROM RIGHT)
         ======================================================== */}
      <AnimatePresence>
        {grantSubModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setGrantSubModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Slide-out Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="w-screen max-w-lg bg-white shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#EAEAEA] flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#D63C1E]/10 flex items-center justify-center text-[#D63C1E]">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1A1A]">Grant Subscription</h3>
                      <p className="text-xs text-[#757575]">Promotional override & partner complimentary plan</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGrantSubModalOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#757575] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Body */}
                <form
                  onSubmit={handleGrantSubscriptionSubmit}
                  className="flex-1 flex flex-col justify-between overflow-y-auto"
                >
                  <div className="p-6 space-y-4 text-xs">
                    {/* Primary Email Search with Auto-Suggest Dropdown */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-[#1A1A1A] block">
                          Subscriber Email (Primary Search) *
                        </label>
                        {selectedSubscriber && (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Subscriber Linked
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <Search className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={grantMerchantEmail}
                          onFocus={() => setEmailSearchFocus(true)}
                          onBlur={() => {
                            setTimeout(() => setEmailSearchFocus(false), 200);
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGrantMerchantEmail(val);
                            setEmailSearchFocus(true);
                            const exact = allocations.find(
                              (a) => a.contactEmail.toLowerCase() === val.toLowerCase().trim()
                            );
                            if (exact) {
                              setGrantMerchantName(exact.merchantName);
                              setGrantStoreName(exact.storeName);
                              setGrantBranch(exact.branch);
                              setGrantMerchantPhone(exact.contactPhone);
                              setSelectedSubscriber(exact);
                            } else {
                              setSelectedSubscriber(null);
                            }
                          }}
                          placeholder="Type or search subscriber email e.g. mateo@kapeisla.ph..."
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none focus:border-[#D63C1E] transition-all font-medium text-xs text-[#1A1A1A] placeholder:text-[#A0A0A0]"
                        />
                      </div>

                      {/* Dropdown with Similar/Matching Emails */}
                      {emailSearchFocus && emailSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-[#EAEAEA] z-30 p-1.5 max-h-56 overflow-y-auto space-y-1">
                          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#757575] flex items-center justify-between border-b border-[#F5F5F5] pb-1">
                            <span>Matching Registered Subscribers</span>
                            <span className="text-[10px] font-normal lowercase">{emailSuggestions.length} found</span>
                          </div>
                          {emailSuggestions.map((sub) => (
                            <div
                              key={sub.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectEmailSuggestion(sub);
                              }}
                              className="p-2.5 rounded-xl hover:bg-[#F5F5F5] cursor-pointer transition-all flex items-center justify-between group"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-[#1A1A1A] group-hover:text-[#D63C1E] transition-colors truncate">
                                    {sub.contactEmail}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3F3F3] text-[#565F6D] font-semibold capitalize">
                                    {sub.currentTier}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#757575] truncate mt-0.5">
                                  {sub.merchantName} • {sub.storeName} ({sub.branch})
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#D63C1E] shrink-0 ml-2 transition-colors" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Auto-filled Merchant Owner Full Name */}
                    <div>
                      <label className="font-semibold text-[#1A1A1A] block mb-1">
                        Merchant Owner Full Name{" "}
                        {grantMerchantName && (
                          <span className="text-emerald-600 font-normal text-[11px]">(Auto-filled)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={grantMerchantName}
                        onChange={(e) => setGrantMerchantName(e.target.value)}
                        placeholder="Auto-filled once email is selected..."
                        className="w-full h-11 px-4 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none focus:border-[#D63C1E] transition-all font-medium text-xs text-[#1A1A1A]"
                      />
                    </div>

                    {/* Auto-linked Store & Account Details (Read-only summary, no separate input fields) */}
                    {grantStoreName && (
                      <div className="p-3.5 rounded-xl bg-white border border-[#EAEAEA] flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#757575] block">
                            Auto-Linked Store
                          </span>
                          <span className="font-bold text-[#1A1A1A] mt-0.5 block">
                            {grantStoreName} <span className="font-normal text-[#757575]">({grantBranch || "Main"})</span>
                          </span>
                        </div>
                        {grantMerchantPhone && (
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#757575] block">
                              Contact
                            </span>
                            <span className="font-medium text-[#1A1A1A] mt-0.5 block">
                              {grantMerchantPhone}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Plan Tier Selection Cards */}
                    <div>
                      <label className="font-semibold text-[#1A1A1A] block mb-1.5">Select Plan Tier to Grant *</label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          {
                            id: "micro" as PlanTier,
                            name: "Micro Tier",
                            tag: "₱99 / mo",
                            specs: "1 Branch • 1 Device",
                          },
                          {
                            id: "small" as PlanTier,
                            name: "Small Tier",
                            tag: "₱499 / mo",
                            specs: "1 Branch • 3 Devices",
                          },
                          {
                            id: "medium" as PlanTier,
                            name: "Medium Tier",
                            tag: "₱1,499 / mo",
                            specs: "5 Branches • Unlimited",
                          },
                        ].map((t) => (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => setGrantTier(t.id)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              grantTier === t.id
                                ? "bg-[#D63C1E]/5 border-[#D63C1E] ring-1 ring-[#D63C1E]"
                                : "bg-[#F9F9F9] border-[#EAEAEA] hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-[#1A1A1A]">{t.name}</span>
                              {grantTier === t.id && <Check className="w-3.5 h-3.5 text-[#D63C1E]" />}
                            </div>
                            <span className="text-[10px] text-[#D63C1E] font-semibold block">{t.tag}</span>
                            <span className="text-[10px] text-[#757575] block mt-0.5">{t.specs}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Grant Type Selection */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#1A1A1A] block mb-1">Grant Campaign Type</label>
                        <select
                          value={grantType}
                          onChange={(e) => setGrantType(e.target.value as GrantType)}
                          className="w-full h-11 px-3 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none cursor-pointer font-medium"
                        >
                          <option value="admin_grant">Admin Manual Grant</option>
                          <option value="promo_free">Partner Promo Free</option>
                          <option value="vip_complimentary">VIP Complimentary</option>
                          <option value="trial">Extended Trial</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-[#1A1A1A] block mb-1">Access Duration</label>
                        <select
                          value={grantDuration}
                          onChange={(e) => setGrantDuration(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none cursor-pointer font-medium"
                        >
                          <option value="30 Days">30 Days</option>
                          <option value="60 Days">60 Days</option>
                          <option value="90 Days">90 Days</option>
                          <option value="1 Year">1 Year</option>
                          <option value="Lifetime">Lifetime Free</option>
                        </select>
                      </div>
                    </div>

                    {/* Admin Memo / Reason */}
                    <div>
                      <label className="font-semibold text-[#1A1A1A] block mb-1">Reason / Justification Memo</label>
                      <textarea
                        rows={3}
                        value={grantAdminNotes}
                        onChange={(e) => setGrantAdminNotes(e.target.value)}
                        placeholder="e.g. Subsidized pilot partnership with Cebu MSME trade association..."
                        className="w-full p-4 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none focus:border-[#D63C1E] transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="p-5 border-t border-[#EAEAEA] bg-white flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setGrantSubModalOpen(false)}
                      className="h-11 px-5 rounded-full border border-[#EAEAEA] text-[#757575] hover:text-[#1A1A1A] font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-11 px-6 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white font-semibold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Confirm Grant (₱0 Charge)</span>
                    </button>
                  </div>
                </form>
              </motion.aside>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
