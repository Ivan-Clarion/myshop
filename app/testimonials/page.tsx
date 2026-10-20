"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Star,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  Download,
  MessageSquare,
  AlertTriangle,
  X,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Clock,
  Store,
  Check,
  Edit3,
  ThumbsUp,
  Award,
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
// TYPES & MOCK DATA
// ====================================================================

export type TestimonialStatus = "Featured" | "Verified" | "Published" | "Flagged" | "Archived";
export type SentimentCategory = "Positive" | "Neutral" | "Constructive" | "Critical";

export interface TestimonialItem {
  id: string; // TEST-80XX
  customerName: string;
  avatarInitials: string;
  contactEmail: string;
  contactPhone: string;
  storeName: string;
  branch: string;
  rating: number; // 1.0 - 5.0
  reviewTitle: string;
  reviewContent: string;
  dateRated: string;
  timeRated: string;
  status: TestimonialStatus;
  sentiment: SentimentCategory;
  channel: "Mobile POS" | "Web Dashboard" | "In-Store QR Feedback" | "Customer App";
  helpfulCount: number;
  adminResponse?: string;
}

const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "TEST-8041",
    customerName: "Elena Cruz",
    avatarInitials: "EC",
    contactEmail: "elena@elenasminimart.ph",
    contactPhone: "+63 917 441 2901",
    storeName: "Elena's Mini Mart",
    branch: "Pasig Market Outlet",
    rating: 5.0,
    reviewTitle: "Seamless digital transition for sari-sari stalls!",
    reviewContent:
      "My sari-sari store transitioned to digital POS smoothly. The offline queue syncing is a true lifesaver during rainy season brownouts here in Pasig! Inventory reports save me 2 hours every evening.",
    dateRated: "Oct 24, 2024",
    timeRated: "14:15 PM",
    status: "Featured",
    sentiment: "Positive",
    channel: "Mobile POS",
    helpfulCount: 42,
    adminResponse: "Thank you Elena! We designed offline queue drain specifically for Philippine micro-retailers.",
  },
  {
    id: "TEST-8042",
    customerName: "Marcus Thorne",
    avatarInitials: "MT",
    contactEmail: "marcus@thornebrewlab.ph",
    contactPhone: "+63 928 882 1092",
    storeName: "Thorne Brew Lab",
    branch: "BGC High Street",
    rating: 3.5,
    reviewTitle: "Solid multi-device checkout, printer sync can improve",
    reviewContent:
      "Good multi-device terminal management for our busy coffee rushes, but would love faster Bluetooth thermal printer reconnects after iPad standby sleep. Otherwise, real-time sales telemetry is spot-on.",
    dateRated: "Oct 23, 2024",
    timeRated: "18:42 PM",
    status: "Published",
    sentiment: "Constructive",
    channel: "Web Dashboard",
    helpfulCount: 19,
    adminResponse: "Firmware v2.4 patch rolling out next Tuesday includes auto-heartbeat keep-alive for ESC/POS printers.",
  },
  {
    id: "TEST-8043",
    customerName: "Sophia Lin",
    avatarInitials: "SL",
    contactEmail: "sophia@lingourmet.com",
    contactPhone: "+63 918 332 9901",
    storeName: "Lin Gourmet Patisserie",
    branch: "Makati Flagship",
    rating: 4.0,
    reviewTitle: "Cut down bakery waste by 25% with automated stock tracking",
    reviewContent:
      "Inventory alerts helped us cut down perishable waste significantly. Our bakery counter staff learned the cashier interface in under an hour without any formal training.",
    dateRated: "Oct 23, 2024",
    timeRated: "11:05 AM",
    status: "Verified",
    sentiment: "Positive",
    channel: "Mobile POS",
    helpfulCount: 28,
  },
  {
    id: "TEST-8044",
    customerName: "David Tan",
    avatarInitials: "DT",
    contactEmail: "david@tanhardware.store",
    contactPhone: "+63 922 771 4450",
    storeName: "Tan Hardware Supplies",
    branch: "Cebu South Reclamation",
    rating: 2.0,
    reviewTitle: "Occasional QR checkout lag during weekend customer surge",
    reviewContent:
      "Experienced lag during Sunday noon rush hours when generating PayMongo and GCash dynamic QR codes. Support team was responsive and re-routed webhook retries, but needs dedicated server bandwidth.",
    dateRated: "Oct 22, 2024",
    timeRated: "09:30 AM",
    status: "Flagged",
    sentiment: "Critical",
    channel: "Mobile POS",
    helpfulCount: 8,
    adminResponse: "Bandwidth upgraded on Region-PH gateway nodes to handle high concurrent QR tokenizations.",
  },
  {
    id: "TEST-8045",
    customerName: "Beatrice Wong",
    avatarInitials: "BW",
    contactEmail: "bwong@ricegrain.ph",
    contactPhone: "+63 939 550 1199",
    storeName: "Wong Rice & Grains",
    branch: "Quezon City Hub",
    rating: 5.0,
    reviewTitle: "The utang ledger credit feature transformed our receivables",
    reviewContent:
      "Customer loyalty program and utang credit tracking ledger keep our neighborhood suki returning every single day. We collect receivables 40% faster now with automatic SMS payment reminders.",
    dateRated: "Oct 21, 2024",
    timeRated: "20:10 PM",
    status: "Featured",
    sentiment: "Positive",
    channel: "In-Store QR Feedback",
    helpfulCount: 36,
  },
  {
    id: "TEST-8046",
    customerName: "Arthur Pendelton",
    avatarInitials: "AP",
    contactEmail: "arthur@pendeltonrx.com",
    contactPhone: "+63 927 662 0041",
    storeName: "Pendelton Pharmacy",
    branch: "Davao City Branch",
    rating: 4.5,
    reviewTitle: "Clean BIR Z-Reading audit reports save our accounting team",
    reviewContent:
      "Excellent reporting export tools. End-of-day Z-readings align cleanly with our accountant spreadsheets and BIR compliance requirements. The multi-branch catalog synchronization is rock solid.",
    dateRated: "Oct 20, 2024",
    timeRated: "16:45 PM",
    status: "Verified",
    sentiment: "Positive",
    channel: "Web Dashboard",
    helpfulCount: 15,
  },
  {
    id: "TEST-8047",
    customerName: "Carmela Santos",
    avatarInitials: "CS",
    contactEmail: "carmela@quickbitediner.ph",
    contactPhone: "+63 919 220 8812",
    storeName: "Quick Bite Diner",
    branch: "Mandaluyong Hub",
    rating: 3.5,
    reviewTitle: "Solid platform for diners, looking forward to food delivery sync",
    reviewContent:
      "Solid platform overall. The UI is clean, modern, and very easy on our cashier staff eyes. Hoping for integrated GrabFood & Foodpanda kitchen receipt order ingestion in the next major update.",
    dateRated: "Oct 19, 2024",
    timeRated: "13:12 PM",
    status: "Published",
    sentiment: "Constructive",
    channel: "Mobile POS",
    helpfulCount: 22,
  },
  {
    id: "TEST-8048",
    customerName: "Gabriel Roxas",
    avatarInitials: "GR",
    contactEmail: "groxas@autoparts.ph",
    contactPhone: "+63 908 440 7719",
    storeName: "Roxas Auto Parts",
    branch: "Cavite Industrial",
    rating: 1.0,
    reviewTitle: "Setup difficulty on weak LTE connection before support intervened",
    reviewContent:
      "Had trouble during initial terminal device setup due to weak local LTE network in our warehouse. The support engineer hopped on a call and configured static IP caching. Working fine now, but initial onboarding was tough.",
    dateRated: "Oct 18, 2024",
    timeRated: "19:55 PM",
    status: "Flagged",
    sentiment: "Critical",
    channel: "Customer App",
    helpfulCount: 5,
    adminResponse: "Assigned senior field technician to verify offline local database replication.",
  },
];

// Dropdown Card: Rating Filters
export const RATING_FILTER_OPTIONS = [
  {
    value: "all",
    label: "All Ratings",
    desc: "Display testimonials across all 1 to 5 star scores",
    badge: "4,820 Total",
  },
  {
    value: "5",
    label: "5 Stars (Exceptional)",
    desc: "Perfect customer scores & promoter testimonials",
    badge: "2,410 Reviews",
  },
  {
    value: "4",
    label: "4 Stars (Very Good)",
    desc: "Strong positive merchant satisfaction with minor notes",
    badge: "1,240 Reviews",
  },
  {
    value: "3",
    label: "3 Stars (Balanced)",
    desc: "Neutral feedback and feature enhancement requests",
    badge: "690 Reviews",
  },
  {
    value: "2",
    label: "2 Stars (Needs Work)",
    desc: "Friction in peripheral hardware or network sync",
    badge: "310 Reviews",
  },
  {
    value: "1",
    label: "1 Star (Critical)",
    desc: "Urgent onboarding or operational pain points",
    badge: "170 Reviews",
  },
];

// Dropdown Card: Status Filters
export const STATUS_FILTER_OPTIONS = [
  {
    value: "all",
    label: "All Statuses",
    desc: "View all customer and merchant feedback entries",
  },
  {
    value: "Featured",
    label: "Featured Reviews",
    desc: "Highlighted testimonials shown on public landing page",
  },
  {
    value: "Verified",
    label: "Verified MSME",
    desc: "Confirmed active subscriber with documented transaction history",
  },
  {
    value: "Published",
    label: "Published Standard",
    desc: "Standard publicly visible customer rating feedback",
  },
  {
    value: "Flagged",
    label: "Flagged for Attention",
    desc: "Customer support follow-up required or low rating issue",
  },
];

export default function TestimonialsPage() {
  // Mobile sidebar navigation
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Data
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(INITIAL_TESTIMONIALS);

  // Side Modal State (STRICT RULE: All tables must use right edge side modal only)
  const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonialItem | null>(null);

  // Edit State inside Side Modal
  const [isEditing, setIsEditing] = useState(false);
  const [editAdminNotes, setEditAdminNotes] = useState("");

  // Lock body scroll when side modal is open
  useEffect(() => {
    if (selectedTestimonial !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedTestimonial]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedTestimonial(null);
        setIsEditing(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered testimonials
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.customerName.toLowerCase().includes(q) ||
        item.storeName.toLowerCase().includes(q) ||
        item.contactEmail.toLowerCase().includes(q) ||
        item.reviewTitle.toLowerCase().includes(q) ||
        item.reviewContent.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      const matchesRating =
        ratingFilter === "all" || Math.floor(item.rating).toString() === ratingFilter;

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [testimonials, searchQuery, ratingFilter, statusFilter]);

  // Paginated testimonials
  const paginatedTestimonials = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTestimonials.slice(start, start + itemsPerPage);
  }, [filteredTestimonials, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredTestimonials.length / itemsPerPage));

  // Change Status Handler
  const handleChangeStatus = (testimonial: TestimonialItem, newStatus: TestimonialStatus) => {
    const updated = { ...testimonial, status: newStatus };
    setTestimonials((prev) => prev.map((t) => (t.id === testimonial.id ? updated : t)));
    setSelectedTestimonial(updated);
    toast.success("Testimonial Status Updated", {
      description: `${testimonial.customerName}'s review is now marked as ${newStatus}.`,
    });
  };

  // Save Admin Note
  const handleSaveAdminNote = () => {
    if (!selectedTestimonial) return;
    const updated = { ...selectedTestimonial, adminResponse: editAdminNotes };
    setTestimonials((prev) => prev.map((t) => (t.id === selectedTestimonial.id ? updated : t)));
    setSelectedTestimonial(updated);
    setIsEditing(false);
    toast.success("Admin Response Saved", {
      description: "Note saved to customer testimonial audit log.",
    });
  };

  // CSV Export Action
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Customer Name",
      "Email",
      "Phone",
      "Store",
      "Branch",
      "Rating",
      "Title",
      "Review",
      "Date",
      "Status",
    ];
    const rows = filteredTestimonials.map((t) => [
      t.id,
      `"${t.customerName}"`,
      t.contactEmail,
      t.contactPhone,
      `"${t.storeName}"`,
      `"${t.branch}"`,
      t.rating,
      `"${t.reviewTitle.replace(/"/g, '""')}"`,
      `"${t.reviewContent.replace(/"/g, '""')}"`,
      `${t.dateRated} ${t.timeRated}`,
      t.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MyShop_Testimonials_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Testimonials Exported", {
      description: `Downloaded ${filteredTestimonials.length} feedback records to CSV.`,
    });
  };

  // Render Stars Helper
  const renderStarRating = (score: number) => {
    const fullStars = Math.floor(score);
    const hasHalf = score % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5 text-amber-500">
        {Array.from({ length: 5 }, (_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />;
          }
          if (i === fullStars && hasHalf) {
            return (
              <span key={i} className="relative inline-block w-3.5 h-3.5">
                <Star className="w-3.5 h-3.5 text-gray-300" />
                <span className="absolute inset-0 overflow-hidden w-1/2">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </span>
              </span>
            );
          }
          return <Star key={i} className="w-3.5 h-3.5 text-gray-300" />;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] font-sans antialiased selection:bg-[#D63C1E] selection:text-white">
      {/* Sidebar Navigation */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <AdminHeader
          title="Testimonials"
          onOpenMobile={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 pt-20 px-4 sm:px-6 md:px-8 pb-12 max-w-[1600px] w-full mx-auto">
          {/* Header & Quick Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                Testimonials &amp; Feedback
              </h1>
              <p className="text-xs sm:text-sm text-[#757575] mt-1">
                Oversee merchant testimonials, customer rating scores, and satisfaction NPS metrics.
              </p>
            </div>

            {/* Export CSV Button */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportCSV}
                className="h-11 px-5 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              SUMMARY KPI CARDS (Floating Neo-Fintech Canvas)
             ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Card 1: Total Testimonials */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#757575] block">
                    Total Testimonials
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
                      4,820
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                      <TrendingUp className="w-3 h-3" />
                      +18.2%
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#D63C1E]/10 flex items-center justify-center text-[#D63C1E] group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#757575]">
                  <span>Verified Merchant Sales</span>
                  <span className="font-bold text-[#1A1A1A]">4,210 (87.3%)</span>
                </div>
                <div className="w-full bg-[#EEEEEE] rounded-full h-2 overflow-hidden flex">
                  <div className="bg-[#D63C1E] h-full rounded-full transition-all" style={{ width: "87.3%" }} />
                </div>
              </div>
            </div>

            {/* Card 2: Rating Score (3.5 / 5.0) */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#757575] block">
                    Rating Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
                      3.5
                    </span>
                    <span className="text-xs text-[#757575] font-semibold">/ 5.0</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                  <Star className="w-5 h-5 fill-amber-500" />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="relative inline-block w-4 h-4">
                    <Star className="w-4 h-4 text-gray-300" />
                    <span className="absolute inset-0 overflow-hidden w-1/2">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </span>
                  </span>
                  <Star className="w-4 h-4 text-gray-200" />
                  <span className="ml-2 text-xs font-bold text-[#1A1A1A]">Balanced Rating</span>
                </div>
                <p className="text-[11px] text-[#757575]">
                  Calculated from 4,820 authentic Philippine store reviews
                </p>
              </div>
            </div>

            {/* Card 3: Rating Point (70.0%) */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#757575] block">
                    Rating Point
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
                      70.0%
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                      <TrendingUp className="w-3 h-3" />
                      +3.2%
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#757575]">
                  <span>Positive Sentiment Index</span>
                  <span className="font-bold text-[#1A1A1A]">3.50 of 5.00 Pt</span>
                </div>
                <div className="w-full bg-[#EEEEEE] rounded-full h-2 overflow-hidden flex">
                  <div
                    className="bg-gradient-to-r from-amber-400 via-[#D63C1E] to-emerald-500 h-full rounded-full transition-all"
                    style={{ width: "70%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              TABLE CONTROLS & FILTER TOOLBAR
             ======================================================== */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Testimonials &amp; Ratings</h2>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search input */}
              <div className="relative min-w-[280px]">
                <Search className="w-3.5 h-3.5 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search customer, review, store..."
                  className="w-full h-10 pl-9 pr-4 rounded-full bg-white border border-[#EAEAEA] text-xs text-[#1A1A1A] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#D63C1E] shadow-xs transition-all"
                />
              </div>

              {/* Rating Filter Dropdown Cards */}
              <DropdownMenu>
                <DropdownMenuTrigger className="h-10 px-4 rounded-full bg-white border border-[#EAEAEA] text-xs font-medium text-[#1A1A1A] flex items-center gap-2 shadow-xs hover:bg-[#F9F9F9] cursor-pointer transition-all">
                  <Star className="w-3.5 h-3.5 text-[#757575]" />
                  <span>
                    Rating: <strong className="text-[#1A1A1A]">{ratingFilter === "all" ? "All (★ 1-5)" : `${ratingFilter} Stars`}</strong>
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#757575]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 rounded-2xl p-2 bg-white shadow-xl border border-[#EAEAEA] z-50 space-y-1"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                    Filter By Star Rating
                  </div>
                  {RATING_FILTER_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => {
                        setRatingFilter(opt.value);
                        setCurrentPage(1);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                        ratingFilter === opt.value
                          ? "bg-[#D63C1E]/5 border border-[#D63C1E]/20"
                          : "hover:bg-[#F5F5F5] border border-transparent"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#1A1A1A]">{opt.label}</span>
                          {ratingFilter === opt.value && (
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
                    Filter By Review Status
                  </div>
                  {STATUS_FILTER_OPTIONS.map((opt) => (
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
              TESTIMONIALS TABLE (Clean Columns Layout)
             ======================================================== */}
          <div className="bg-white rounded-3xl border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F0F0F0] text-[#757575] text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6">Name of Customer / Merchant</th>
                    <th className="py-3.5 px-4">Store &amp; Branch</th>
                    <th className="py-3.5 px-4 text-center">Rating Score</th>
                    <th className="py-3.5 px-4">Date Rated</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F7F7]">
                  {paginatedTestimonials.length > 0 ? (
                    paginatedTestimonials.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => {
                          setSelectedTestimonial(item);
                          setIsEditing(false);
                          setEditAdminNotes(item.adminResponse || "");
                        }}
                        className="hover:bg-[#F9F9F9] transition-colors group cursor-pointer"
                      >
                        {/* Clean Customer / Merchant Name with Initials Avatar */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#D63C1E]/10 text-[#D63C1E] font-bold text-xs flex items-center justify-center shrink-0">
                              {item.avatarInitials}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-xs text-[#1A1A1A] group-hover:text-[#D63C1E] transition-colors">
                                {item.customerName}
                              </span>
                              <span className="text-[11px] text-[#757575]">
                                {item.contactEmail}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Store & Branch */}
                        <td className="py-4 px-4 text-xs font-semibold text-[#1A1A1A] whitespace-nowrap">
                          <span>{item.storeName}</span>
                          <span className="text-[11px] text-[#757575] font-normal block">{item.branch}</span>
                        </td>

                        {/* Rating Score with colored pill */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                              item.rating >= 4.5
                                ? "bg-emerald-50 text-emerald-700"
                                : item.rating >= 3.5
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            <Star className="w-3 h-3 fill-current" />
                            {item.rating.toFixed(1)}
                          </span>
                        </td>

                        {/* Date Rated */}
                        <td className="py-4 px-4 text-xs font-medium text-[#1A1A1A] whitespace-nowrap">
                          <div>{item.dateRated}</div>
                          <div className="text-[11px] text-[#757575] font-normal">{item.timeRated}</div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              item.status === "Featured"
                                ? "bg-[#D63C1E]/10 text-[#D63C1E]"
                                : item.status === "Verified"
                                ? "bg-emerald-50 text-emerald-700"
                                : item.status === "Published"
                                ? "bg-blue-50 text-blue-700"
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
                              setSelectedTestimonial(item);
                              setIsEditing(false);
                              setEditAdminNotes(item.adminResponse || "");
                            }}
                            className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] transition-all cursor-pointer"
                            title="Inspect Testimonial"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-[#757575]">
                        No testimonials or reviews match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="py-4 px-6 border-t border-[#F5F5F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#757575]">
              <div>
                Showing <span className="font-semibold text-[#1A1A1A]">{paginatedTestimonials.length}</span> of{" "}
                <span className="font-semibold text-[#1A1A1A]">{filteredTestimonials.length}</span> testimonials
              </div>

              {/* Controls */}
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
          SLIDE-OUT SIDE MODAL: TESTIMONIAL INSPECTION (RIGHT ONLY)
         ======================================================== */}
      <AnimatePresence>
        {selectedTestimonial && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setSelectedTestimonial(null);
                setIsEditing(false);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Right Sliding Panel */}
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
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1A1A]">{selectedTestimonial.id}</h3>
                      <p className="text-xs text-[#757575]">Merchant Testimonial &amp; Feedback</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTestimonial(null);
                      setIsEditing(false);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#757575] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                  {/* Rating & Sentiment Status Banner */}
                  <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#757575] block">Rating Score</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-extrabold text-lg text-[#1A1A1A]">
                          {selectedTestimonial.rating.toFixed(1)}
                        </span>
                        {renderStarRating(selectedTestimonial.rating)}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#757575] block">Current Status</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                          selectedTestimonial.status === "Featured"
                            ? "bg-[#D63C1E]/10 text-[#D63C1E]"
                            : selectedTestimonial.status === "Verified"
                            ? "bg-emerald-50 text-emerald-700"
                            : selectedTestimonial.status === "Published"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {selectedTestimonial.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#757575] block">Channel</span>
                      <span className="font-semibold text-[#1A1A1A] block mt-1">
                        {selectedTestimonial.channel}
                      </span>
                    </div>
                  </div>

                  {/* Merchant Subscriber Profile (Strictly Full Name & Contact Info) */}
                  <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] space-y-2.5">
                    <div className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider text-[#757575]">
                      Merchant Subscriber Profile
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                      <span className="text-[#757575]">Full Name:</span>
                      <span className="font-bold text-[#1A1A1A]">{selectedTestimonial.customerName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                      <span className="text-[#757575]">Contact Phone:</span>
                      <span className="font-semibold text-[#1A1A1A]">{selectedTestimonial.contactPhone}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#757575]">Contact Email:</span>
                      <span className="font-semibold text-[#1A1A1A]">{selectedTestimonial.contactEmail}</span>
                    </div>
                  </div>

                  {/* Testimonial & Review Details (Clean border, NO gray background, text-black) */}
                  <div className="space-y-2">
                    <div className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider text-[#757575]">
                      Testimonial Details
                    </div>
                    <div className="p-4 rounded-2xl border border-[#EAEAEA] bg-white space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#757575] block">
                          Review Subject
                        </span>
                        <h4 className="text-sm font-bold text-black mt-0.5">
                          "{selectedTestimonial.reviewTitle}"
                        </h4>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#757575] block mb-1">
                          Merchant Feedback
                        </span>
                        <p className="text-black font-medium leading-relaxed">
                          {selectedTestimonial.reviewContent}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#F5F5F5] flex items-center justify-between text-[11px] text-[#757575]">
                        <span>
                          Store: <strong className="text-black">{selectedTestimonial.storeName}</strong> ({selectedTestimonial.branch})
                        </span>
                        <span>
                          {selectedTestimonial.dateRated} • {selectedTestimonial.timeRated}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Administrative Response / Memo */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider text-[#757575]">
                        Admin Audit Response
                      </span>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="text-[11px] font-semibold text-[#D63C1E] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Response</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={editAdminNotes}
                          onChange={(e) => setEditAdminNotes(e.target.value)}
                          placeholder="Type administrative response or internal resolution memo..."
                          className="w-full p-3.5 rounded-xl border border-[#EAEAEA] bg-white focus:outline-none focus:border-[#D63C1E] text-black font-medium resize-none text-xs"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1.5 rounded-full border border-[#EAEAEA] text-xs font-semibold text-[#757575] hover:text-[#1A1A1A]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveAdminNote}
                            className="px-4 py-1.5 rounded-full bg-[#D63C1E] text-white text-xs font-semibold hover:bg-[#B22204]"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-black font-medium leading-relaxed p-3.5 rounded-xl border border-[#EAEAEA] bg-white">
                        {selectedTestimonial.adminResponse || "No administrative notes logged for this review yet."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls: Mark as Dropdown & Edit Action */}
                <div className="p-5 border-t border-[#EAEAEA] bg-white flex items-center justify-between gap-3">
                  {/* Mark as: Dropdown Card (STRICT RULE: Dropdown instead of separate buttons) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-10 px-4 rounded-full border border-[#EAEAEA] bg-white text-xs font-semibold text-[#1A1A1A] hover:bg-[#F9F9F9] flex items-center gap-2 cursor-pointer shadow-xs transition-all">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#D63C1E]" />
                      <span>
                        Mark as: <strong className="text-[#1A1A1A]">{selectedTestimonial.status}</strong>
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#757575]" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-72 rounded-2xl p-2 bg-white shadow-xl border border-[#EAEAEA] z-50 space-y-1"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                        Change Review Visibility
                      </div>
                      {[
                        {
                          val: "Featured" as TestimonialStatus,
                          label: "Featured Review",
                          desc: "Pin on official website & marketing landing page",
                        },
                        {
                          val: "Verified" as TestimonialStatus,
                          label: "Verified MSME",
                          desc: "Mark as validated authentic store subscriber",
                        },
                        {
                          val: "Published" as TestimonialStatus,
                          label: "Published Standard",
                          desc: "Visible in standard feedback directory",
                        },
                        {
                          val: "Flagged" as TestimonialStatus,
                          label: "Flag for Follow-up",
                          desc: "Alert merchant support team to contact owner",
                        },
                        {
                          val: "Archived" as TestimonialStatus,
                          label: "Archive Record",
                          desc: "Hide from active operational feeds",
                        },
                      ].map((opt) => (
                        <DropdownMenuItem
                          key={opt.val}
                          onClick={() => handleChangeStatus(selectedTestimonial, opt.val)}
                          className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 border ${
                            selectedTestimonial.status === opt.val
                              ? "bg-[#D63C1E]/5 border-[#D63C1E]/30"
                              : "hover:bg-[#F5F5F5] border-transparent"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#1A1A1A]">{opt.label}</span>
                              {selectedTestimonial.status === opt.val && (
                                <Check className="w-3.5 h-3.5 text-[#D63C1E]" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#757575] leading-snug mt-0.5">{opt.desc}</p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Edit Button (STRICT RULE: replace close button with edit) */}
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="h-10 px-5 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? "Editing Note" : "Edit"}</span>
                  </button>
                </div>
              </motion.aside>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
