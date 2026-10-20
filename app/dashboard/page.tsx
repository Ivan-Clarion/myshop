"use client";

import { useState } from "react";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  Layers,
  Activity,
  MoreVertical,
  ArrowUpRight,
  ShieldCheck,
  Server,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "today" | "month" | "quarter">("week");
  const [currentPage, setCurrentPage] = useState(1);

  const apiServices = [
    {
      name: "POS Checkout & Terminal API",
      endpoint: "POST /api/v2/pos/transactions/charge",
      lastCall: "Just now",
      status: "Operational",
      uptime: "99.99%",
    },
    {
      name: "Payment Gateway Integration",
      endpoint: "POST /api/v1/payments/card-gateway/settle",
      lastCall: "45s ago",
      status: "Operational",
      uptime: "99.95%",
    },
    {
      name: "Real-Time Inventory Sync API",
      endpoint: "PUT /api/v2/inventory/sku/stock-delta",
      lastCall: "2m ago",
      status: "Operational",
      uptime: "100%",
    },
    {
      name: "E-Invoicing & BIR Fiscal Node",
      endpoint: "POST /api/v1/fiscal/invoicing/generate-batch",
      lastCall: "5m ago",
      status: "Operational",
      uptime: "99.98%",
    },
    {
      name: "Merchant Auth & Session Service",
      endpoint: "POST /api/v1/auth/tokens/verify-terminal",
      lastCall: "Just now",
      status: "Operational",
      uptime: "100%",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] font-sans antialiased">
      {/* 1. Admin Sidebar */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Layout Wrap (with left padding for fixed sidebar) */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Header */}
        <AdminHeader
          title="Dashboard"
          onOpenMobile={() => setMobileMenuOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 pt-20 pb-12 px-4 sm:px-6 md:px-8 max-w-[1440px] w-full mx-auto">
          {/* SECTION 1: Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Metric 1: Total Completed Reports */}
            <div className="relative overflow-hidden rounded-[24px] bg-white p-6 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-[#EAEAEA] flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#00A651]/5 pointer-events-none blur-2xl" />
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#757575] font-bold block mb-1">
                    Fiscal Reporting
                  </span>
                  <h2 className="text-base font-bold text-[#1A1A1A]">
                    Total Completed Reports
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#F3F3F3] flex items-center justify-center text-[#00A651] shadow-inner">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2.5 my-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
                  1,284
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#00A651]/10 text-[#00A651] text-xs font-bold">
                  +14.2% vs yesterday
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between text-[#757575] text-xs">
                <span>Across 18 regional retail branches</span>
                <span className="font-bold text-[#1A1A1A]">99.1% Rate</span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-[#EEEEEE] rounded-full h-1.5 mt-3 overflow-hidden">
                <div className="bg-[#00A651] h-full rounded-full" style={{ width: "94%" }} />
              </div>
            </div>

            {/* Metric 2: Total Pending Reports */}
            <div className="relative overflow-hidden rounded-[24px] bg-white p-6 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-[#EAEAEA] flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#FFC107]/10 pointer-events-none blur-2xl" />
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#757575] font-bold block mb-1">
                    Pending Clearance
                  </span>
                  <h2 className="text-base font-bold text-[#1A1A1A]">
                    Total Pending Reports
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#F3F3F3] flex items-center justify-center text-[#FFC107] shadow-inner">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2.5 my-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
                  47
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FFC107]/15 text-[#B27B00] text-xs font-bold">
                  Action Required
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between text-[#757575] text-xs">
                <span>Awaiting regional audit clearance</span>
                <span className="font-bold text-[#1A1A1A]">3 Critical</span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-[#EEEEEE] rounded-full h-1.5 mt-3 overflow-hidden">
                <div className="bg-[#FFC107] h-full rounded-full" style={{ width: "22%" }} />
              </div>
            </div>

            {/* Metric 3: Total Rejected Reports */}
            <div className="relative overflow-hidden rounded-[24px] bg-white p-6 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-[#EAEAEA] flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#D63C1E]/10 pointer-events-none blur-2xl" />
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#757575] font-bold block mb-1">
                    Audit Discrepancies
                  </span>
                  <h2 className="text-base font-bold text-[#1A1A1A]">
                    Total Rejected Reports
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#F3F3F3] flex items-center justify-center text-[#D63C1E] shadow-inner">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2.5 my-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
                  12
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#D63C1E]/10 text-[#D63C1E] text-xs font-bold">
                  Flagged for Reconciliation
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between text-[#757575] text-xs">
                <span>Discrepancies in cash vs ledger balance</span>
                <span className="font-bold text-[#D63C1E]">₱18,420 delta</span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-[#EEEEEE] rounded-full h-1.5 mt-3 overflow-hidden">
                <div className="bg-[#D63C1E] h-full rounded-full" style={{ width: "8%" }} />
              </div>
            </div>
          </div>

          {/* SECTION 2: Analytics Grid (Sales Trend Chart & Donut Distribution) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Left: Total Sales Trend Area Chart (8 of 12 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 rounded-[28px] bg-white p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-[#EAEAEA] flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#757575] font-bold block mb-1">
                      Financial Trend
                    </span>
                    <h2 className="text-xl font-bold text-[#1A1A1A]">
                      Total Sales Trend
                    </h2>
                  </div>

                  {/* Period Filter Dropdown */}
                  <div className="relative inline-flex items-center self-start sm:self-auto">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value as any)}
                      className="appearance-none bg-[#F5F5F5] hover:bg-[#EEEEEE] text-[#1A1A1A] text-xs font-semibold pl-4 pr-9 py-2 rounded-full border border-[#EAEAEA] outline-none cursor-pointer shadow-sm transition-colors"
                    >
                      <option value="week">This Week</option>
                      <option value="today">Today</option>
                      <option value="month">This Month</option>
                      <option value="quarter">Quarterly</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#757575] absolute right-3 pointer-events-none" />
                  </div>
                </div>

                {/* Sales Highlights Row */}
                <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-[#EAEAEA]">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-[#757575] uppercase tracking-wider font-bold">
                      Gross Merchandise Value (GMV)
                    </span>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight leading-none">
                        ₱4,892,450.00
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#00A651]/10 text-[#00A651] text-xs font-bold">
                        <TrendingUp className="w-3.5 h-3.5" /> +12.8% vs last week
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F5F5F5]/70 border border-[#EAEAEA]">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#757575] uppercase tracking-wider font-bold">
                          NET PROFIT
                        </span>
                        <span className="text-lg font-bold text-[#1A1A1A] tracking-tight mt-0.5">
                          ₱1,389,450.00
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00A651]/10 text-[#00A651] text-xs font-bold shrink-0">
                        <TrendingUp className="w-3 h-3" /> +28.4% Margin
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F5F5F5]/70 border border-[#EAEAEA]">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#757575] uppercase tracking-wider font-bold">
                          TRANSACTIONS
                        </span>
                        <span className="text-lg font-bold text-[#1A1A1A] tracking-tight mt-0.5">
                          11,689
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00A651]/10 text-[#00A651] text-xs font-bold shrink-0">
                        <TrendingUp className="w-3 h-3" /> +5.4%
                      </span>
                    </div>
                  </div>
                </div>

                {/* High Fidelity SVG Area Chart */}
                <div className="relative w-full overflow-hidden pt-2">
                  <svg
                    className="w-full h-64 overflow-visible"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 700 220"
                  >
                    <defs>
                      <linearGradient id="brandAreaGlowClean" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#D63C1E" stopOpacity="0.22" />
                        <stop offset="60%" stopColor="#D63C1E" stopOpacity="0.04" />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="navyBaselineGlow" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#565F6D" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                      </linearGradient>
                      <filter id="cleanGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1A1C1C" floodOpacity="0.18" />
                      </filter>
                    </defs>

                    {/* Gridlines */}
                    <line x1="0" y1="30" x2="700" y2="30" stroke="#F0F0F0" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="0" y1="85" x2="700" y2="85" stroke="#F0F0F0" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="0" y1="140" x2="700" y2="140" stroke="#F0F0F0" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="0" y1="195" x2="700" y2="195" stroke="#F5F5F5" strokeWidth="1" />

                    {/* Baseline Area & Curve */}
                    <path
                      d="M 0,160 C 100,150 180,140 260,145 C 340,150 420,130 500,120 C 580,110 640,125 700,105 L 700,200 L 0,200 Z"
                      fill="url(#navyBaselineGlow)"
                    />
                    <path
                      d="M 0,160 C 100,150 180,140 260,145 C 340,150 420,130 500,120 C 580,110 640,125 700,105"
                      fill="none"
                      stroke="#BEC7D7"
                      strokeDasharray="4 4"
                      strokeWidth="1.5"
                    />

                    {/* Actual Sales Curve & Fill */}
                    <path
                      d="M 0,140 C 90,130 160,85 240,95 C 320,105 380,45 470,35 C 550,25 620,80 700,45 L 700,200 L 0,200 Z"
                      fill="url(#brandAreaGlowClean)"
                    />
                    <path
                      d="M 0,140 C 90,130 160,85 240,95 C 320,105 380,45 470,35 C 550,25 620,80 700,45"
                      fill="none"
                      stroke="#D63C1E"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                    />

                    {/* Peak Marker on Friday */}
                    <line x1="470" y1="35" x2="470" y2="195" stroke="#D63C1E" strokeDasharray="3 3" strokeOpacity="0.35" strokeWidth="1.5" />
                    <circle cx="470" cy="35" r="6" fill="#FFFFFF" stroke="#D63C1E" strokeWidth="3" filter="url(#cleanGlowFilter)" />
                    <circle cx="240" cy="95" r="4" fill="#FFFFFF" stroke="#565F6D" strokeWidth="2" />
                    <circle cx="700" cy="45" r="4" fill="#FFFFFF" stroke="#D63C1E" strokeWidth="2" />

                    {/* Peak Tooltip Pill */}
                    <g transform="translate(410, -5)">
                      <rect width="124" height="30" rx="15" fill="#1A1C1C" filter="url(#cleanGlowFilter)" />
                      <text x="62" y="19" fill="#FFFFFF" fontFamily="Inter" fontSize="11" fontWeight="600" textAnchor="middle">
                        ₱884,120 · Peak Fri
                      </text>
                    </g>
                  </svg>

                  {/* Day Axis Labels */}
                  <div className="flex justify-between items-center text-[#757575] text-xs pt-3 px-2 font-medium">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span className="font-bold text-[#1A1A1A] bg-[#F3F3F3] px-2.5 py-0.5 rounded-full border border-[#EAEAEA]">
                      Fri (Peak)
                    </span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-3 text-[#757575] text-xs bg-[#F5F5F5]/60 px-4 py-2.5 rounded-full border border-[#EAEAEA]/80">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D63C1E] shrink-0" />
                    <span className="font-semibold text-[#1A1A1A]">Current Sales Velocity</span>
                  </div>
                  <span className="text-[#E2E2E2]">·</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#BEC7D7] shrink-0" />
                    <span>Previous 7-Day Baseline</span>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-[#757575]">
                  Updated real-time from mobile registers
                </span>
              </div>
            </div>

            {/* Right: Tier Distribution Donut Chart (4 of 12 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 rounded-[28px] bg-white p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-[#EAEAEA] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#757575] font-bold block mb-1">
                      Subscriber Mix
                    </span>
                    <h2 className="text-xl font-bold text-[#1A1A1A]">
                      Tier Distribution
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info("Tier Distribution Options", { description: "Filter by region, province, or revenue band." })}
                    className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[#757575] text-xs leading-relaxed mb-6 font-normal">
                  Active merchant storefront breakdown mapped by active billing plan subscriptions.
                </p>

                {/* Donut Chart Container */}
                <div className="relative flex items-center justify-center my-4">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
                    {/* Background Ring */}
                    <circle cx="80" cy="80" r="62" fill="transparent" stroke="#F0F0F0" strokeWidth="18" />
                    {/* Segment 1: Popular/Small (52%) -> stroke-dasharray="202.5 389.5" */}
                    <circle
                      cx="80"
                      cy="80"
                      r="62"
                      fill="transparent"
                      stroke="#D63C1E"
                      strokeWidth="18"
                      strokeDasharray="202.5 389.5"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                    {/* Segment 2: Accessible/Micro (28%) -> stroke-dasharray="109 389.5" */}
                    <circle
                      cx="80"
                      cy="80"
                      r="62"
                      fill="transparent"
                      stroke="#0078C7"
                      strokeWidth="18"
                      strokeDasharray="109 389.5"
                      strokeDashoffset="-202.5"
                      strokeLinecap="round"
                    />
                    {/* Segment 3: Enterprise/Medium (15%) -> stroke-dasharray="58.4 389.5" */}
                    <circle
                      cx="80"
                      cy="80"
                      r="62"
                      fill="transparent"
                      stroke="#1A232F"
                      strokeWidth="18"
                      strokeDasharray="58.4 389.5"
                      strokeDashoffset="-311.5"
                      strokeLinecap="round"
                    />
                    {/* Segment 4: Free/Standard (5%) -> stroke-dasharray="19.4 389.5" */}
                    <circle
                      cx="80"
                      cy="80"
                      r="62"
                      fill="transparent"
                      stroke="#BEC7D7"
                      strokeWidth="18"
                      strokeDasharray="19.4 389.5"
                      strokeDashoffset="-370"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Centered Donut Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[10px] uppercase tracking-wider text-[#757575] font-bold">
                      Stores
                    </span>
                    <span className="text-3xl font-extrabold text-[#1A1A1A] leading-tight">
                      3,410
                    </span>
                    <span className="text-[11px] text-[#00A651] font-bold">
                      100% Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Tier Legend & Metrics Breakdown */}
              <div className="flex flex-col gap-2 pt-4 border-t border-[#EAEAEA]">
                {/* Enterprise */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F3F3F3] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#D63C1E] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1A1A1A]">Popular (Small)</span>
                      <span className="text-[11px] text-[#757575]">1,773 stores</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#1A1A1A]">52%</span>
                    <span className="text-[10px] text-[#757575] block">₱884.7k MRR</span>
                  </div>
                </div>

                {/* Business */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F3F3F3] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#0078C7] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1A1A1A]">Accessible (Micro)</span>
                      <span className="text-[11px] text-[#757575]">955 stores</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#1A1A1A]">28%</span>
                    <span className="text-[10px] text-[#757575] block">₱94.5k MRR</span>
                  </div>
                </div>

                {/* Enterprise Tier */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F3F3F3] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#1A232F] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1A1A1A]">Enterprise (Medium)</span>
                      <span className="text-[11px] text-[#757575]">512 stores</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#1A1A1A]">15%</span>
                    <span className="text-[10px] text-[#757575] block">₱767.4k MRR</span>
                  </div>
                </div>

                {/* Free / Starter */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F3F3F3] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#BEC7D7] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1A1A1A]">Standard (Free)</span>
                      <span className="text-[11px] text-[#757575]">170 stores</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#1A1A1A]">5%</span>
                    <span className="text-[10px] text-[#757575] block">₱0 MRR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: System Overview & Telemetry Table */}
          <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-[#EAEAEA] flex flex-col">
            {/* Table Strip Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-4 border-b border-[#EAEAEA]">
              <div>
                <div className="flex items-center gap-2 text-[#757575] text-[11px] uppercase tracking-wider font-bold mb-1">
                  <span>Infrastructure Real-Time Telemetry</span>
                  <span>·</span>
                  <span className="text-[#0078C7]">Health &amp; Uptime</span>
                </div>
                <h2 className="text-xl font-bold text-[#1A1A1A]">
                  System Overview &amp; API Services
                </h2>
              </div>

              {/* Status Indicators Bar */}
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-full bg-[#00A651]/10 flex items-center gap-2 border border-[#00A651]/20 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00A651] shrink-0 animate-pulse" />
                  <span className="text-xs font-bold text-[#00A651]">
                    Active APIs: 24/24 Operational
                  </span>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-[#F5F5F5] flex items-center gap-2 border border-[#EAEAEA] shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#565F6D]" />
                  <span className="text-xs font-bold text-[#1A1A1A]">
                    Down Count: 0
                  </span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#757575] text-[11px] uppercase tracking-wider border-b border-[#EAEAEA]">
                    <th className="py-3.5 font-bold pl-3">API Service &amp; Endpoint</th>
                    <th className="py-3.5 font-bold">Last Call</th>
                    <th className="py-3.5 font-bold">Uptime (30d)</th>
                    <th className="py-3.5 font-bold text-right pr-3">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]/60 text-sm">
                  {apiServices.map((service, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-[#F9F9F9] transition-colors h-14"
                    >
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#565F6D] shrink-0">
                            <Server className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#1A1A1A]">
                              {service.name}
                            </span>
                            <span className="text-xs text-[#757575] font-mono">
                              {service.endpoint}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3">
                        <span className="text-xs font-medium text-[#1A1A1A] bg-[#F5F5F5] px-2.5 py-1 rounded-full border border-[#EAEAEA]">
                          {service.lastCall}
                        </span>
                      </td>

                      <td className="py-3 text-xs font-bold text-[#00A651]">
                        {service.uptime}
                      </td>

                      <td className="py-3 text-right pr-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A651]/10 text-[#00A651] text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00A651]" />
                          {service.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-[#EAEAEA]">
              <div className="text-xs text-[#757575]">
                Displaying <span className="font-bold text-[#1A1A1A]">5</span> of{" "}
                <span className="font-bold text-[#1A1A1A]">24</span> Core APIs &amp; Microservices
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#EEEEEE] text-[#565F6D] hover:text-[#1A1A1A] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Previous
                </button>

                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-[#D63C1E] text-white shadow-sm"
                        : "bg-[#F5F5F5] hover:bg-[#EEEEEE] text-[#1A1A1A]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <span className="text-[#757575] px-1 text-xs">...</span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                  className="px-3.5 py-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#EEEEEE] text-[#565F6D] hover:text-[#1A1A1A] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
