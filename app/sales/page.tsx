"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp,
  ArrowUp,
  Download,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Receipt,
  Plus,
  Printer,
  Mail,
  X,
  Tag,
  Store,
  User,
  Phone,
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Sparkles,
  Award,
  Layers,
  Server,
  Zap,
  Pencil,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Papa from "papaparse";
import { toast } from "sonner";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- TYPES ALIGNED WITH schema.sql (subscription_sales & subscriptions) ---

interface SubscriptionSale {
  id: string; // SUB-TXN-XXXX
  ownerId: string;
  storeName: string;
  storeBranch: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  planTier: "micro" | "small" | "medium" | "enterprise";
  billingInterval: "monthly" | "annual";
  amount: number;
  currency: "PHP";
  paymentStatus: "paid" | "refunded" | "failed" | "pending" | "complimentary";
  paymentMethod: "PayMongo" | "GCash" | "Maya" | "Card" | "Admin_Grant" | "Promo";
  grantType: "purchase" | "admin_grant" | "promo_free" | "vip_complimentary" | "trial";
  grantedBy?: string;
  adminNotes?: string;
  paymongoPaymentId?: string;
  paymongoCheckoutSessionId?: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  maxBranches: number;
  maxDevices: number | "unlimited";
}

interface SaasOperatingExpense {
  id: string;
  category: string;
  categoryColor: string;
  vendor: string;
  referenceNo: string;
  date: string;
  amount: number;
  status: string;
  description: string;
  approvedBy: string;
}

// Initial Mock Subscription Sales (Aligned with schema.sql tiers & pricing)
const INITIAL_SUBSCRIPTIONS: SubscriptionSale[] = [
  {
    id: "SUB-TXN-94021",
    ownerId: "usr_4a91b2c8",
    storeName: "San Roque Super Mart",
    storeBranch: "Main Branch (Makati)",
    customerName: "Alex Johnson",
    customerEmail: "alex.johnson@sanroquemart.ph",
    customerPhone: "+63 917 882 1920",
    planTier: "medium",
    billingInterval: "annual",
    amount: 14990.0,
    currency: "PHP",
    paymentStatus: "paid",
    paymentMethod: "PayMongo",
    grantType: "purchase",
    paymongoPaymentId: "pay_m94021_pm_gcash",
    paymongoCheckoutSessionId: "cs_live_994012849",
    periodStart: "Oct 24, 2024",
    periodEnd: "Oct 24, 2025",
    createdAt: "Oct 24, 2024 • 14:32 PM",
    maxBranches: 5,
    maxDevices: "unlimited",
    adminNotes: "Self-service renewal via PayMongo GCash checkout.",
  },
  {
    id: "SUB-TXN-94020",
    ownerId: "usr_7b19e4f0",
    storeName: "Santos Mini Mart & Sari-Sari",
    storeBranch: "Quezon City Hub",
    customerName: "Maria Santos",
    customerEmail: "maria.santos@gmail.com",
    customerPhone: "+63 928 341 0021",
    planTier: "small",
    billingInterval: "monthly",
    amount: 499.0,
    currency: "PHP",
    paymentStatus: "paid",
    paymentMethod: "GCash",
    grantType: "purchase",
    paymongoPaymentId: "pay_m94020_gcash",
    paymongoCheckoutSessionId: "cs_live_883019283",
    periodStart: "Oct 24, 2024",
    periodEnd: "Nov 24, 2024",
    createdAt: "Oct 24, 2024 • 14:18 PM",
    maxBranches: 1,
    maxDevices: 3,
    adminNotes: "Auto-debit recurring subscription via GCash PayMongo vault.",
  },
  {
    id: "SUB-TXN-94019",
    ownerId: "usr_1c88d3e2",
    storeName: "Wayne Convenience Kiosk",
    storeBranch: "Cebu IT Park",
    customerName: "Kenneth Wayne",
    customerEmail: "k.wayne@cebukiosk.com",
    customerPhone: "+63 932 770 4152",
    planTier: "micro",
    billingInterval: "monthly",
    amount: 99.0,
    currency: "PHP",
    paymentStatus: "paid",
    paymentMethod: "Maya",
    grantType: "purchase",
    paymongoPaymentId: "pay_m94019_maya",
    paymongoCheckoutSessionId: "cs_live_772019482",
    periodStart: "Oct 24, 2024",
    periodEnd: "Nov 24, 2024",
    createdAt: "Oct 24, 2024 • 13:50 PM",
    maxBranches: 1,
    maxDevices: 1,
    adminNotes: "Micro sari-sari starter tier upgrade.",
  },
  {
    id: "SUB-TXN-94018",
    ownerId: "usr_9d22f1a6",
    storeName: "Lim Hardware & Agro-Supply",
    storeBranch: "Davao Central",
    customerName: "Clara Lim",
    customerEmail: "clara.lim@limhardware.ph",
    customerPhone: "+63 919 654 3390",
    planTier: "enterprise",
    billingInterval: "annual",
    amount: 45000.0,
    currency: "PHP",
    paymentStatus: "paid",
    paymentMethod: "Card",
    grantType: "purchase",
    paymongoPaymentId: "pay_m94018_card_bdo",
    paymongoCheckoutSessionId: "cs_live_661029381",
    periodStart: "Oct 24, 2024",
    periodEnd: "Oct 24, 2025",
    createdAt: "Oct 24, 2024 • 13:42 PM",
    maxBranches: 20,
    maxDevices: "unlimited",
    adminNotes: "Enterprise multi-warehouse retail chain contract with SLA.",
  },
  {
    id: "SUB-TXN-94017",
    ownerId: "usr_3e55c7b9",
    storeName: "Vance Gourmet Corner",
    storeBranch: "BGC High Street",
    customerName: "David Vance",
    customerEmail: "david.v@vancegourmet.ph",
    customerPhone: "+63 945 109 2831",
    planTier: "small",
    billingInterval: "monthly",
    amount: -499.0,
    currency: "PHP",
    paymentStatus: "refunded",
    paymentMethod: "Card",
    grantType: "purchase",
    paymongoPaymentId: "ref_m94017_bpi",
    paymongoCheckoutSessionId: "cs_live_550192837",
    periodStart: "Oct 24, 2024",
    periodEnd: "Nov 24, 2024",
    createdAt: "Oct 24, 2024 • 12:25 PM",
    maxBranches: 1,
    maxDevices: 3,
    adminNotes: "Customer requested cancellation within 48h trial window.",
  },
  {
    id: "SUB-TXN-94016",
    ownerId: "usr_8f44a9d1",
    storeName: "Isla Organics & Grocer",
    storeBranch: "Iloilo City Proper",
    customerName: "Isla Romero",
    customerEmail: "isla.romero@islaorganics.com",
    customerPhone: "+63 918 440 9182",
    planTier: "medium",
    billingInterval: "monthly",
    amount: 1499.0,
    currency: "PHP",
    paymentStatus: "paid",
    paymentMethod: "PayMongo",
    grantType: "purchase",
    paymongoPaymentId: "pay_m94016_gcash",
    paymongoCheckoutSessionId: "cs_live_449182736",
    periodStart: "Oct 24, 2024",
    periodEnd: "Nov 24, 2024",
    createdAt: "Oct 24, 2024 • 11:58 AM",
    maxBranches: 5,
    maxDevices: "unlimited",
    adminNotes: "Upgraded from Small Tier to Medium Tier for 3 branch support.",
  },
  {
    id: "SUB-TXN-94015",
    ownerId: "usr_2a77e8c3",
    storeName: "Sy Wholesalers Manila",
    storeBranch: "Binondo Commercial Hub",
    customerName: "George Sy",
    customerEmail: "george.sy@sywholesale.com.ph",
    customerPhone: "+63 927 889 0019",
    planTier: "medium",
    billingInterval: "annual",
    amount: 0.0,
    currency: "PHP",
    paymentStatus: "complimentary",
    paymentMethod: "Admin_Grant",
    grantType: "vip_complimentary",
    grantedBy: "Alex Rivera (Super Admin)",
    periodStart: "Oct 24, 2024",
    periodEnd: "Oct 24, 2025",
    createdAt: "Oct 24, 2024 • 10:45 AM",
    maxBranches: 5,
    maxDevices: "unlimited",
    adminNotes: "Strategic MSME ambassador grant for Binondo Retailers Association.",
  },
  {
    id: "SUB-TXN-94014",
    ownerId: "usr_6c33d5f4",
    storeName: "Cruz Neighborhood Mart",
    storeBranch: "Pasig Kapitolyo",
    customerName: "Elena Cruz",
    customerEmail: "elena.cruz@gmail.com",
    customerPhone: "+63 908 123 4567",
    planTier: "small",
    billingInterval: "monthly",
    amount: 499.0,
    currency: "PHP",
    paymentStatus: "paid",
    paymentMethod: "Maya",
    grantType: "purchase",
    paymongoPaymentId: "pay_m94014_maya",
    paymongoCheckoutSessionId: "cs_live_338192041",
    periodStart: "Oct 24, 2024",
    periodEnd: "Nov 24, 2024",
    createdAt: "Oct 24, 2024 • 10:12 AM",
    maxBranches: 1,
    maxDevices: 3,
    adminNotes: "Standard monthly renewal.",
  },
  {
    id: "SUB-TXN-94013",
    ownerId: "usr_5e66b1a2",
    storeName: "Tan Lifestyle Provisions",
    storeBranch: "Alabang Town Center",
    customerName: "Ronald Tan",
    customerEmail: "ronald.tan@tanprovisions.ph",
    customerPhone: "+63 917 552 9012",
    planTier: "small",
    billingInterval: "annual",
    amount: 4990.0,
    currency: "PHP",
    paymentStatus: "paid",
    paymentMethod: "Card",
    grantType: "purchase",
    paymongoPaymentId: "pay_m94013_card_bpi",
    paymongoCheckoutSessionId: "cs_live_227183920",
    periodStart: "Oct 24, 2024",
    periodEnd: "Oct 24, 2025",
    createdAt: "Oct 24, 2024 • 09:40 AM",
    maxBranches: 1,
    maxDevices: 3,
    adminNotes: "Annual upfront discount availed (2 months free).",
  },
  {
    id: "SUB-TXN-94012",
    ownerId: "usr_9a11f7c8",
    storeName: "Reyes Corner Pharmacy",
    storeBranch: "Pampanga San Fernando",
    customerName: "Bianca Reyes",
    customerEmail: "bianca.reyes@reyesrx.ph",
    customerPhone: "+63 922 900 1124",
    planTier: "micro",
    billingInterval: "monthly",
    amount: 99.0,
    currency: "PHP",
    paymentStatus: "paid",
    paymentMethod: "GCash",
    grantType: "purchase",
    paymongoPaymentId: "pay_m94012_gcash",
    paymongoCheckoutSessionId: "cs_live_116029384",
    periodStart: "Oct 24, 2024",
    periodEnd: "Nov 24, 2024",
    createdAt: "Oct 24, 2024 • 09:15 AM",
    maxBranches: 1,
    maxDevices: 1,
    adminNotes: "Micro retail tier active.",
  },
];

// Initial Mock SaaS Platform Operating Expenses
const INITIAL_EXPENSES: SaasOperatingExpense[] = [
  {
    id: "EXP-8801",
    category: "Cloud Infrastructure",
    categoryColor: "bg-blue-100 text-blue-800",
    vendor: "Amazon Web Services (AWS)",
    referenceNo: "INV-AWS-882194",
    date: "Oct 24, 2024",
    amount: -185400.0,
    status: "Paid",
    description: "Postgres RDS multi-AZ DB clusters, Supabase telemetry instances, and Redis session caches.",
    approvedBy: "Alex Rivera (Super Admin)",
  },
  {
    id: "EXP-8802",
    category: "Payment Gateway MDR",
    categoryColor: "bg-purple-100 text-purple-800",
    vendor: "PayMongo Philippines Inc.",
    referenceNo: "MDR-PAYMONGO-OCT24",
    date: "Oct 23, 2024",
    amount: -94200.0,
    status: "Paid",
    description: "Credit card & e-wallet processing MDR interchange fees (2.5% card / 1.5% GCash & Maya).",
    approvedBy: "Alex Rivera (Super Admin)",
  },
  {
    id: "EXP-8803",
    category: "SMS & Communications",
    categoryColor: "bg-amber-100 text-amber-800",
    vendor: "Semaphore / Twilio SMS Gateway",
    referenceNo: "SMS-PH-OCT-4019",
    date: "Oct 22, 2024",
    amount: -42500.0,
    status: "Paid",
    description: "One-time password (OTP) verification SMS and merchant daily transaction summary alerts.",
    approvedBy: "DevOps Head (J. Santos)",
  },
  {
    id: "EXP-8804",
    category: "Office & Co-working",
    categoryColor: "bg-stone-200 text-stone-800",
    vendor: "KMC Solutions BGC",
    referenceNo: "LSE-KMC-BGC-2024",
    date: "Oct 21, 2024",
    amount: -120000.0,
    status: "Paid",
    description: "HQ startup workspace, engineering hub, and customer success pod in Bonifacio Global City.",
    approvedBy: "Finance Lead (B. Gomez)",
  },
  {
    id: "EXP-8805",
    category: "Software Licenses",
    categoryColor: "bg-rose-100 text-rose-800",
    vendor: "Vercel Inc. & GitHub Enterprise",
    referenceNo: "LIC-DEV-2024-91",
    date: "Oct 20, 2024",
    amount: -28600.0,
    status: "Paid",
    description: "Next.js Turbopack Edge deployments, CI/CD runners, and automated security code audits.",
    approvedBy: "DevOps Head (J. Santos)",
  },
  {
    id: "EXP-8806",
    category: "Legal & BIR Compliance",
    categoryColor: "bg-teal-100 text-teal-800",
    vendor: "Sycip Salazar Hernandez & Gatmaitan",
    referenceNo: "LGL-BIR-TAX-991",
    date: "Oct 19, 2024",
    amount: -65000.0,
    status: "Audited",
    description: "SaaS BIR Computerized Accounting System (CAS) registration and merchant privacy review.",
    approvedBy: "Alex Rivera (Super Admin)",
  },
];

// Helper to format Philippine Peso Currency
function formatPHP(amount: number): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absVal);

  return isNegative ? `-${formatted}` : formatted;
}

// Plan tier badge style helper
function getPlanBadge(tier: string) {
  switch (tier.toLowerCase()) {
    case "enterprise":
      return {
        label: "Enterprise",
        classes: "bg-purple-100 text-purple-800 border-purple-200",
      };
    case "medium":
      return {
        label: "Medium",
        classes: "bg-[#D63C1E]/10 text-[#D63C1E] border-[#D63C1E]/20",
      };
    case "small":
      return {
        label: "Small",
        classes: "bg-blue-100 text-blue-800 border-blue-200",
      };
    case "micro":
      return {
        label: "Micro",
        classes: "bg-amber-100 text-amber-800 border-amber-200",
      };
    default:
      return {
        label: "Free",
        classes: "bg-stone-100 text-stone-700 border-stone-200",
      };
  }
}

function SalesPageContent() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") === "revenue" ? "revenue" : "sales";

  const [activeTab, setActiveTab] = useState<"sales" | "revenue">(initialView);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters & State
  const [selectedRange, setSelectedRange] = useState("Jan 1 – Dec 31, 2024");
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Dynamic Categories and Statuses Lists
  const [categoriesList, setCategoriesList] = useState<string[]>([
    "Cloud Infrastructure",
    "Payment Gateway MDR",
    "SMS & Communications",
    "Office & Co-working",
    "Software Licenses",
    "Legal & BIR Compliance",
  ]);

  const [statusesList, setStatusesList] = useState<string[]>([
    "Paid",
    "Pending",
    "Audited",
  ]);

  // SIDE MODAL STATES
  const [selectedSub, setSelectedSub] = useState<SubscriptionSale | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<SaasOperatingExpense | null>(null);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<SaasOperatingExpense | null>(null);

  // Add Expense form states
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [customStatusMode, setCustomStatusMode] = useState(false);
  const [customStatusInput, setCustomStatusInput] = useState("");

  const [newExpense, setNewExpense] = useState({
    category: "Cloud Infrastructure",
    vendor: "",
    amount: "",
    referenceNo: "",
    status: "Paid",
    description: "",
  });

  // Edit Expense form custom toggles
  const [editCustomCategoryMode, setEditCustomCategoryMode] = useState(false);
  const [editCustomCategoryInput, setEditCustomCategoryInput] = useState("");
  const [editCustomStatusMode, setEditCustomStatusMode] = useState(false);
  const [editCustomStatusInput, setEditCustomStatusInput] = useState("");

  // Dynamic Data Lists
  const [subscriptionsList, setSubscriptionsList] = useState<SubscriptionSale[]>(INITIAL_SUBSCRIPTIONS);
  const [expensesList, setExpensesList] = useState<SaasOperatingExpense[]>(INITIAL_EXPENSES);

  // Lock background scroll when any side modal is open
  useEffect(() => {
    const isAnyModalOpen =
      selectedSub !== null ||
      selectedExpense !== null ||
      addExpenseOpen ||
      editingExpense !== null;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedSub, selectedExpense, addExpenseOpen, editingExpense]);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedSub(null);
        setSelectedExpense(null);
        setAddExpenseOpen(false);
        setEditingExpense(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptionsList.filter((item) => {
      const matchesSearch =
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlan = planFilter === "All" || item.planTier.toLowerCase() === planFilter.toLowerCase();
      const matchesPayment = paymentFilter === "All" || item.paymentMethod.includes(paymentFilter);

      return matchesSearch && matchesPlan && matchesPayment;
    });
  }, [subscriptionsList, searchQuery, planFilter, paymentFilter]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expensesList.filter((item) => {
      const matchesSearch =
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [expensesList, searchQuery, categoryFilter]);

  // Pagination Slices
  const paginatedSubscriptions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSubscriptions.slice(start, start + itemsPerPage);
  }, [filteredSubscriptions, currentPage]);

  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(start, start + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      (activeTab === "sales" ? filteredSubscriptions.length : filteredExpenses.length) / itemsPerPage
    )
  );

  // Export CSV handler
  const handleExportCSV = () => {
    if (activeTab === "sales") {
      const exportData = filteredSubscriptions.map((s) => ({
        "Subscription Txn ID": s.id,
        "Date & Time": s.createdAt,
        "Customer / Merchant": s.customerName,
        "Merchant Email": s.customerEmail,
        "Merchant Phone": s.customerPhone,
        "Store Name": s.storeName,
        "Store Branch": s.storeBranch,
        "Plan Tier": s.planTier.toUpperCase(),
        "Billing Interval": s.billingInterval.toUpperCase(),
        "Amount Charged (PHP)": s.amount,
        "Payment Method": s.paymentMethod,
        "Payment Status": s.paymentStatus,
        "Grant Type": s.grantType,
        "PayMongo ID": s.paymongoPaymentId || "N/A",
        "Active Period Start": s.periodStart,
        "Active Period End": s.periodEnd,
        "Admin Notes": s.adminNotes || "N/A",
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `myshop_subscription_sales_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Subscription Sales Ledger Exported", {
        description: `Exported ${filteredSubscriptions.length} merchant subscription records to CSV.`,
      });
    } else {
      const exportData = filteredExpenses.map((e) => ({
        "Expense ID": e.id,
        Category: e.category,
        Vendor: e.vendor,
        "Reference No": e.referenceNo,
        Date: e.date,
        "Amount (PHP)": e.amount,
        Status: e.status,
        Description: e.description,
        "Approved By": e.approvedBy,
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `myshop_operating_expenses_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Operating Expenses Exported", {
        description: `Exported ${filteredExpenses.length} platform expense records to CSV.`,
      });
    }
  };

  // Add Expense submission
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.vendor || !newExpense.amount) {
      toast.error("Please fill in required fields.");
      return;
    }

    const finalCategory = customCategoryMode && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : newExpense.category;

    const finalStatus = customStatusMode && customStatusInput.trim()
      ? customStatusInput.trim()
      : newExpense.status;

    // Dynamically update available categories & statuses list
    if (customCategoryMode && customCategoryInput.trim() && !categoriesList.includes(customCategoryInput.trim())) {
      setCategoriesList((prev) => [...prev, customCategoryInput.trim()]);
    }
    if (customStatusMode && customStatusInput.trim() && !statusesList.includes(customStatusInput.trim())) {
      setStatusesList((prev) => [...prev, customStatusInput.trim()]);
    }

    const numAmount = -Math.abs(parseFloat(newExpense.amount) || 0);
    const newEntry: SaasOperatingExpense = {
      id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      category: finalCategory,
      categoryColor: "bg-teal-100 text-teal-800",
      vendor: newExpense.vendor,
      referenceNo: newExpense.referenceNo || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      date: "Oct 24, 2024",
      amount: numAmount,
      status: finalStatus,
      description: newExpense.description || "Operational SaaS platform expenditure",
      approvedBy: "Alex Rivera (Super Admin)",
    };

    setExpensesList([newEntry, ...expensesList]);
    setAddExpenseOpen(false);
    setCustomCategoryMode(false);
    setCustomCategoryInput("");
    setCustomStatusMode(false);
    setCustomStatusInput("");
    setNewExpense({
      category: finalCategory,
      vendor: "",
      amount: "",
      referenceNo: "",
      status: finalStatus,
      description: "",
    });

    toast.success("Expense Recorded", {
      description: `Added ${formatPHP(numAmount)} for ${newEntry.vendor}.`,
    });
  };

  // Edit Expense submission
  const handleEditExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    const finalCategory = editCustomCategoryMode && editCustomCategoryInput.trim()
      ? editCustomCategoryInput.trim()
      : editingExpense.category;

    const finalStatus = editCustomStatusMode && editCustomStatusInput.trim()
      ? editCustomStatusInput.trim()
      : editingExpense.status;

    // Update dynamic options if needed
    if (editCustomCategoryMode && editCustomCategoryInput.trim() && !categoriesList.includes(editCustomCategoryInput.trim())) {
      setCategoriesList((prev) => [...prev, editCustomCategoryInput.trim()]);
    }
    if (editCustomStatusMode && editCustomStatusInput.trim() && !statusesList.includes(editCustomStatusInput.trim())) {
      setStatusesList((prev) => [...prev, editCustomStatusInput.trim()]);
    }

    const updatedList = expensesList.map((item) => {
      if (item.id === editingExpense.id) {
        return {
          ...editingExpense,
          category: finalCategory,
          status: finalStatus,
        };
      }
      return item;
    });

    setExpensesList(updatedList);
    setEditingExpense(null);
    setEditCustomCategoryMode(false);
    setEditCustomCategoryInput("");
    setEditCustomStatusMode(false);
    setEditCustomStatusInput("");

    toast.success("Expense Updated", {
      description: `Changes to ${editingExpense.vendor} saved successfully.`,
    });
  };

  // Open Edit Expense from Detail Modal
  const handleOpenEditExpense = (expense: SaasOperatingExpense) => {
    setEditingExpense({ ...expense });
    setSelectedExpense(null);
    setEditCustomCategoryMode(false);
    setEditCustomCategoryInput("");
    setEditCustomStatusMode(false);
    setEditCustomStatusInput("");
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] font-sans antialiased">
      {/* 1. Admin Navigation Drawer */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Canvas */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <AdminHeader
          title="Sales & Revenue Management"
          onOpenMobile={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 pt-20 pb-16 px-4 sm:px-6 md:px-8 max-w-7xl w-full mx-auto">
          {/* Top Control Bar / View Toggle & Utilities */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            {/* View Switcher Segmented Pill */}
            <div className="inline-flex items-center p-1 bg-[#EFEFEF] rounded-full self-start shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("sales");
                  setCurrentPage(1);
                  setSearchQuery("");
                }}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === "sales"
                    ? "bg-white text-[#1A1A1A] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                    : "text-[#757575] hover:text-[#1A1A1A]"
                }`}
              >
                Subscriptions
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("revenue");
                  setCurrentPage(1);
                  setSearchQuery("");
                }}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === "revenue"
                    ? "bg-white text-[#1A1A1A] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                    : "text-[#757575] hover:text-[#1A1A1A]"
                }`}
              >
                Platform Expenses
              </button>
            </div>

            {/* Right Action Utilities */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="h-11 px-4 inline-flex items-center gap-2 rounded-full bg-white hover:bg-[#F3F3F3] text-[#1A1A1A] text-xs sm:text-sm font-medium border border-[#EAEAEA] shadow-sm transition-all focus:outline-none cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#757575]" />
                  <span>{selectedRange}</span>
                  <ChevronDown className="w-4 h-4 text-[#757575]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-lg bg-white border border-[#EAEAEA]">
                  {["Today", "Last 7 Days", "Last 30 Days", "Q3 2024", "Jan 1 – Dec 31, 2024"].map((range) => (
                    <DropdownMenuItem
                      key={range}
                      onClick={() => {
                        setSelectedRange(range);
                        toast.info("Date Range Filter Updated", { description: range });
                      }}
                      className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer hover:bg-[#F5F5F5]"
                    >
                      {range}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Download Report Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="h-11 px-5 inline-flex items-center gap-2 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>
          </div>

          {/* Metric KPI Cards (3 Grid - SaaS Startup Subscription Metrics) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {activeTab === "sales" ? (
              <>
                {/* KPI 1: Annual Recurring Revenue / Subscription Sales */}
                <div className="relative bg-white rounded-[28px] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-[#EAEAEA]/80 flex flex-col justify-between hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#757575]">
                      Total Subscription Sales
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[#00A651] bg-[#00A651]/10 text-xs font-semibold">
                      <ArrowUp className="w-3.5 h-3.5" />
                      +24.5% YoY
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                    ₱4,820,450.00
                  </div>
                  <div className="text-[11px] text-[#757575] mt-2">
                    Platform recurring billing via PayMongo & manual grants
                  </div>
                </div>

                {/* KPI 2: Active Paid Store Subscriptions */}
                <div className="relative bg-white rounded-[28px] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-[#EAEAEA]/80 flex flex-col justify-between hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#757575]">
                      Active Paid Merchants
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[#00A651] bg-[#00A651]/10 text-xs font-semibold">
                      <ArrowUp className="w-3.5 h-3.5" />
                      +18.2% YoY
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                    3,410 Stores
                  </div>
                  <div className="text-[11px] text-[#757575] mt-2">
                    Micro (1,820) • Small (1,140) • Medium (450)
                  </div>
                </div>

                {/* KPI 3: Monthly Recurring Revenue (MRR) */}
                <div className="relative bg-white rounded-[28px] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-[#EAEAEA]/80 flex flex-col justify-between hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#757575]">
                      Monthly Recurring (MRR)
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[#00A651] bg-[#00A651]/10 text-xs font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +14.7% MoM
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                    ₱485,200.00
                  </div>
                  <div className="text-[11px] text-[#757575] mt-2">
                    Forecasted annualized run-rate: ₱5.82M
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Revenue KPI 1: Gross Subscription Revenue */}
                <div className="relative bg-white rounded-[28px] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-[#EAEAEA]/80 flex flex-col justify-between hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#757575]">
                      Platform Gross Revenue
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[#00A651] bg-[#00A651]/10 text-xs font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +24.5% YoY
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                    ₱4,820,450.00
                  </div>
                </div>

                {/* Revenue KPI 2: Total SaaS Operating Expenses */}
                <div className="relative bg-white rounded-[28px] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-[#EAEAEA]/80 flex flex-col justify-between hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#757575]">
                      Platform Operating Costs
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-amber-700 bg-amber-500/15 text-xs font-semibold">
                      25.9% of Revenue
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                    ₱1,248,500.00
                  </div>
                </div>

                {/* Revenue KPI 3: Net SaaS Platform Profit */}
                <div className="relative bg-white rounded-[28px] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-[#EAEAEA]/80 flex flex-col justify-between hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#757575]">
                      Net Platform Profit
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[#00A651] bg-[#00A651]/10 text-xs font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +31.4% YoY
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                    ₱3,571,950.00
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Detailed Data Section (Floating Card Canvas) */}
          <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-[#EAEAEA]/80 flex flex-col">
            {/* Table Header & Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#F0F0F0]">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
                  {activeTab === "sales" ? "Subscription Billing Ledger" : "Operating Expenses Breakdown"}
                </h2>
                <p className="text-xs sm:text-sm text-[#757575] mt-1">
                  {activeTab === "sales"
                    ? "SaaS subscription purchases, renewals, PayMongo charges, and manual admin grants."
                    : "Consolidated platform operating expenditures, cloud infrastructure, and regulatory fees."}
                </p>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Field */}
                <div className="relative flex items-center bg-[#F3F3F3] px-3.5 py-2 rounded-full w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#757575] mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={
                      activeTab === "sales"
                        ? "Search merchant, store, ID..."
                        : "Search vendor, category, voucher..."
                    }
                    className="bg-transparent text-xs sm:text-sm text-[#1A1A1A] placeholder:text-[#757575] focus:outline-none w-full"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-[#757575] hover:text-[#1A1A1A]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {activeTab === "sales" ? (
                  /* Plan Tier Filter Pill */
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      type="button"
                      className="h-10 px-4 inline-flex items-center gap-2 rounded-full bg-[#F3F3F3] hover:bg-[#EAEAEA] text-[#565F6D] hover:text-[#1A1A1A] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-[#757575]" />
                      <span>Tier: {planFilter}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#757575]" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44 rounded-2xl p-1 shadow-md bg-white border border-[#EAEAEA]">
                      {["All", "Micro", "Small", "Medium", "Enterprise"].map((tier) => (
                        <DropdownMenuItem
                          key={tier}
                          onClick={() => {
                            setPlanFilter(tier);
                            setCurrentPage(1);
                          }}
                          className="rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer"
                        >
                          {tier}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    {/* Category Filter Pill */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        type="button"
                        className="h-10 px-4 inline-flex items-center gap-2 rounded-full bg-[#F3F3F3] hover:bg-[#EAEAEA] text-[#565F6D] hover:text-[#1A1A1A] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Tag className="w-3.5 h-3.5 text-[#757575]" />
                        <span>Category: {categoryFilter}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#757575]" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 rounded-2xl p-1 shadow-md bg-white border border-[#EAEAEA]">
                        {["All", ...categoriesList].map((cat) => (
                          <DropdownMenuItem
                            key={cat}
                            onClick={() => {
                              setCategoryFilter(cat);
                              setCurrentPage(1);
                            }}
                            className="rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer"
                          >
                            {cat}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Add Expense Button (Opens Side Modal) */}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomCategoryMode(false);
                        setCustomCategoryInput("");
                        setCustomStatusMode(false);
                        setCustomStatusInput("");
                        setAddExpenseOpen(true);
                      }}
                      className="h-10 px-4 inline-flex items-center gap-1.5 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Expense</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Structured Table */}
            <div className="overflow-x-auto w-full mt-4">
              {activeTab === "sales" ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#F0F0F0] text-[#757575] text-[11px] uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Plan Tier</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F7F7]">
                    {paginatedSubscriptions.map((sub) => {
                      const badge = getPlanBadge(sub.planTier);
                      return (
                        <tr
                          key={sub.id}
                          className="hover:bg-[#F9F9F9] transition-colors group cursor-pointer"
                          onClick={() => setSelectedSub(sub)}
                        >
                          <td className="py-4 px-4 text-xs font-medium text-[#1A1A1A] whitespace-nowrap">
                            {sub.createdAt}
                          </td>
                          {/* Transaction ID only (clean, no subtext) */}
                          <td className="py-4 px-4 text-xs font-semibold text-[#1A1A1A] whitespace-nowrap font-mono">
                            {sub.id}
                          </td>
                          {/* Customer only (clean, no contact number) */}
                          <td className="py-4 px-4 text-xs font-semibold text-[#1A1A1A] whitespace-nowrap">
                            {sub.customerName}
                          </td>
                          {/* Plan Tier Badge */}
                          <td className="py-4 px-4 text-xs whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.classes}`}>
                              <span>{badge.label}</span>
                              <span className="text-[10px] opacity-75">({sub.billingInterval === "annual" ? "Yr" : "Mo"})</span>
                            </span>
                          </td>
                          {/* Payment Method */}
                          <td className="py-4 px-4 text-xs whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                sub.paymentMethod === "PayMongo"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : sub.paymentMethod === "GCash"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : sub.paymentMethod === "Maya"
                                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                                  : sub.paymentMethod === "Admin_Grant"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              }`}
                            >
                              {sub.paymentMethod === "Admin_Grant" ? "Admin Grant" : sub.paymentMethod}
                            </span>
                          </td>
                          {/* Amount */}
                          <td
                            className={`py-4 px-4 text-right text-xs font-semibold whitespace-nowrap ${
                              sub.amount < 0 ? "text-[#D32F2F]" : sub.amount === 0 ? "text-[#757575]" : "text-[#1A1A1A]"
                            }`}
                          >
                            {sub.amount === 0 ? "₱0.00 (Grant)" : formatPHP(sub.amount)}
                          </td>
                          {/* Payment Status */}
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                                sub.paymentStatus === "paid" || sub.paymentStatus === "complimentary"
                                  ? "bg-[#00A651]/10 text-[#00A651]"
                                  : "bg-[#D32F2F]/10 text-[#D32F2F]"
                              }`}
                            >
                              {sub.paymentStatus}
                            </span>
                          </td>
                          {/* Action Button */}
                          <td className="py-4 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSub(sub);
                              }}
                              className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] transition-all"
                              title="Open Subscription Side Modal"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedSubscriptions.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-xs text-[#757575]">
                          No subscription billing records found matching your filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#F0F0F0] text-[#757575] text-[11px] uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Vendor / Payee</th>
                      <th className="py-3 px-4">Reference & Date</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F7F7]">
                    {paginatedExpenses.map((exp) => (
                      <tr
                        key={exp.id}
                        className="hover:bg-[#F9F9F9] transition-colors group cursor-pointer"
                        onClick={() => setSelectedExpense(exp)}
                      >
                        <td className="py-4 px-4 text-xs whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${exp.categoryColor}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-[#1A1A1A] whitespace-nowrap">
                          {exp.vendor}
                        </td>
                        <td className="py-4 px-4 text-xs whitespace-nowrap">
                          <div className="font-medium text-[#1A1A1A]">{exp.referenceNo}</div>
                          <div className="text-[11px] text-[#757575]">{exp.date}</div>
                        </td>
                        <td className="py-4 px-4 text-right text-xs font-semibold text-[#1A1A1A] whitespace-nowrap">
                          {formatPHP(exp.amount)}
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                            {exp.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExpense(exp);
                            }}
                            className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] transition-all"
                            title="Open Expense Side Modal"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {paginatedExpenses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-xs text-[#757575]">
                          No platform operating expenses found matching your filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 mt-4 border-t border-[#F0F0F0]">
              <div className="text-xs text-[#757575]">
                Showing{" "}
                <span className="font-semibold text-[#1A1A1A]">
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    activeTab === "sales" ? filteredSubscriptions.length : filteredExpenses.length
                  )}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-[#1A1A1A]">
                  {Math.min(
                    currentPage * itemsPerPage,
                    activeTab === "sales" ? filteredSubscriptions.length : filteredExpenses.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#1A1A1A]">
                  {activeTab === "sales" ? "3,410" : "142"}
                </span>{" "}
                records
              </div>

              {/* Number Buttons & Arrows */}
              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#757575] hover:bg-[#F0F0F0] hover:text-[#1A1A1A] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-[#D63C1E] text-white shadow-sm"
                        : "text-[#757575] hover:bg-[#F0F0F0] hover:text-[#1A1A1A]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <span className="w-6 text-center text-xs text-[#757575]">...</span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-2.5 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === totalPages
                      ? "bg-[#D63C1E] text-white shadow-sm"
                      : "text-[#757575] hover:bg-[#F0F0F0] hover:text-[#1A1A1A]"
                  }`}
                >
                  {activeTab === "sales" ? "426" : "18"}
                </button>

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
          SIDE MODAL 1: SUBSCRIPTION BILLING DETAIL (SLIDES FROM RIGHT)
         ======================================================== */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedSub(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Slide-out Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 350 }}
                className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-[#EAEAEA]"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between bg-[#FDFDFD]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D63C1E]/10 flex items-center justify-center text-[#D63C1E]">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#1A1A1A]">Subscription Details</h2>
                      <p className="text-xs text-[#757575] font-mono">{selectedSub.id} • {selectedSub.createdAt}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="w-9 h-9 rounded-full bg-[#F3F3F3] hover:bg-[#EAEAEA] flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Top Amount Banner */}
                  <div className="p-5 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#757575]">
                        Billing Amount Charged
                      </span>
                      <div className={`text-2xl font-bold tracking-tight mt-0.5 ${
                        selectedSub.amount < 0 ? "text-[#D32F2F]" : "text-[#1A1A1A]"
                      }`}>
                        {selectedSub.amount === 0 ? "₱0.00 (Admin Grant)" : formatPHP(selectedSub.amount)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          selectedSub.paymentStatus === "paid" || selectedSub.paymentStatus === "complimentary"
                            ? "bg-[#00A651]/10 text-[#00A651]"
                            : "bg-[#D32F2F]/10 text-[#D32F2F]"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {selectedSub.paymentStatus}
                      </span>
                      <span className="text-[11px] text-[#757575] capitalize">
                        {selectedSub.billingInterval} Plan
                      </span>
                    </div>
                  </div>

                  {/* Plan Tier Entitlements (schema.sql max_branches & max_devices) */}
                  <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#757575]">
                        Plan Entitlements & Limits
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${getPlanBadge(selectedSub.planTier).classes}`}>
                        {selectedSub.planTier} Tier
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-[#EAEAEA]">
                        <span className="text-[10px] text-[#757575] block">Store Branches</span>
                        <span className="font-semibold text-[#1A1A1A]">{selectedSub.maxBranches} Branch{selectedSub.maxBranches > 1 ? "es" : ""}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-[#EAEAEA]">
                        <span className="text-[10px] text-[#757575] block">Terminal POS Devices</span>
                        <span className="font-semibold text-[#1A1A1A] capitalize">{selectedSub.maxDevices} {typeof selectedSub.maxDevices === "number" ? "Device" + (selectedSub.maxDevices > 1 ? "s" : "") : ""}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-[#EAEAEA]">
                        <span className="text-[10px] text-[#757575] block">Cloud DB Sync</span>
                        <span className="font-semibold text-emerald-600">Active (Real-time)</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-[#EAEAEA]">
                        <span className="text-[10px] text-[#757575] block">AI Supplier Invoicing</span>
                        <span className="font-semibold text-emerald-600">Enabled</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer / Merchant Profile (Full Name & Contact Info Only) */}
                  <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#757575]">
                      Merchant Subscriber Profile
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center font-bold text-[#1A1A1A] shadow-xs shrink-0">
                        {selectedSub.customerName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-[#1A1A1A] text-sm leading-tight">
                          {selectedSub.customerName}
                        </div>
                        <div className="text-[11px] text-[#757575] flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#757575]" />
                            <span>{selectedSub.customerPhone}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#757575]" />
                            <span>{selectedSub.customerEmail}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment & PayMongo Gateway Metadata */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#757575] text-[11px]">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Payment Method</span>
                      </div>
                      <div className="font-semibold text-[#1A1A1A]">{selectedSub.paymentMethod}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#757575] text-[11px]">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Grant / Order Type</span>
                      </div>
                      <div className="font-semibold text-[#1A1A1A] capitalize">{selectedSub.grantType.replace("_", " ")}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-1 col-span-2">
                      <div className="flex items-center justify-between text-[#757575] text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Active Billing Period</span>
                        </span>
                        <span className="text-emerald-700 font-medium">Valid License</span>
                      </div>
                      <div className="font-semibold text-[#1A1A1A]">
                        {selectedSub.periodStart} → {selectedSub.periodEnd}
                      </div>
                    </div>

                    {selectedSub.paymongoPaymentId && (
                      <div className="p-3.5 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-1 col-span-2">
                        <div className="text-[#757575] text-[11px]">PayMongo Gateway Reference</div>
                        <div className="font-mono text-xs text-[#1A1A1A]">{selectedSub.paymongoPaymentId}</div>
                      </div>
                    )}

                    {selectedSub.adminNotes && (
                      <div className="p-3.5 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-1 col-span-2">
                        <div className="text-[#757575] text-[11px]">Admin Memo / Audit Log</div>
                        <div className="text-xs text-[#1A1A1A]">{selectedSub.adminNotes}</div>
                      </div>
                    )}
                  </div>

                  {/* Fiscal Breakdown (BIR e-Invoice standard) */}
                  <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-2 text-xs">
                    <div className="flex justify-between text-[#757575]">
                      <span>Software SaaS Base Fee</span>
                      <span>{formatPHP(selectedSub.amount * 0.8928)}</span>
                    </div>
                    <div className="flex justify-between text-[#757575]">
                      <span>Value Added Tax (12% VAT)</span>
                      <span>{formatPHP(selectedSub.amount * 0.1072)}</span>
                    </div>
                    <div className="border-t border-[#EAEAEA] pt-2 flex justify-between font-bold text-sm text-[#1A1A1A]">
                      <span>Total Subscription Settlement</span>
                      <span>{formatPHP(selectedSub.amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer Actions */}
                <div className="p-5 border-t border-[#F0F0F0] bg-[#FDFDFD] flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Subscription Invoice PDF Exported", {
                        description: `Saved ${selectedSub.id}_invoice.pdf.`,
                      });
                    }}
                    className="flex-1 h-11 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Billing Email Sent", {
                        description: `Dispatched receipt to ${selectedSub.customerEmail}.`,
                      });
                    }}
                    className="h-11 px-5 rounded-full bg-[#F3F3F3] hover:bg-[#EAEAEA] text-[#1A1A1A] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Email</span>
                  </button>
                </div>
              </motion.aside>
            </div>
          </div>
        )}
      </AnimatePresence>



      {/* ========================================================
          SIDE MODAL 3: OPERATING EXPENSE DETAIL (SLIDES FROM RIGHT)
         ======================================================== */}
      <AnimatePresence>
        {selectedExpense && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedExpense(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Slide-out Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 350 }}
                className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-[#EAEAEA]"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between bg-[#FDFDFD]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#1A1A1A]">Platform Expense Voucher</h2>
                      <p className="text-xs text-[#757575]">{selectedExpense.referenceNo} • {selectedExpense.date}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedExpense(null)}
                    className="w-9 h-9 rounded-full bg-[#F3F3F3] hover:bg-[#EAEAEA] flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Amount Banner */}
                  <div className="p-5 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#757575]">
                        Disbursed Total
                      </span>
                      <div className="text-2xl font-bold tracking-tight text-[#1A1A1A] mt-0.5">
                        {formatPHP(selectedExpense.amount)}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      {selectedExpense.status}
                    </span>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#757575] text-[11px]">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Expense Category</span>
                      </div>
                      <div className="font-semibold text-[#1A1A1A]">{selectedExpense.category}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#757575] text-[11px]">
                        <Building className="w-3.5 h-3.5" />
                        <span>Payee / Vendor</span>
                      </div>
                      <div className="font-semibold text-[#1A1A1A]">{selectedExpense.vendor}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#757575] text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Disbursement Date</span>
                      </div>
                      <div className="font-semibold text-[#1A1A1A]">{selectedExpense.date}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#757575] text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Authorized By</span>
                      </div>
                      <div className="font-semibold text-[#1A1A1A]">{selectedExpense.approvedBy}</div>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#757575]">
                      Disbursement Purpose & Justification
                    </span>
                    <p className="text-xs text-[#1A1A1A] leading-relaxed">
                      {selectedExpense.description}
                    </p>
                  </div>

                  {/* Audit Trail Note */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-blue-900 space-y-1">
                      <div className="font-semibold">Fiscal Compliance Verified</div>
                      <p className="text-[11px] text-blue-700">
                        This voucher is signed off according to Philippine BIR Form 2307 withholding rules and reconciled with corporate disbursement ledgers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer (Replaced "Close" with "Edit") */}
                <div className="p-5 border-t border-[#F0F0F0] bg-[#FDFDFD] flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Voucher PDF Exported", {
                        description: `Saved ${selectedExpense.referenceNo}.pdf to downloads.`,
                      });
                    }}
                    className="flex-1 h-11 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Voucher PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditExpense(selectedExpense)}
                    className="h-11 px-6 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </motion.aside>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          SIDE MODAL 4: ADD EXPENSE (SLIDES FROM RIGHT)
         ======================================================== */}
      <AnimatePresence>
        {addExpenseOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setAddExpenseOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Slide-out Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 350 }}
                className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-[#EAEAEA]"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between bg-[#FDFDFD]">
                  <div>
                    <h2 className="text-base font-bold text-[#1A1A1A]">Record Platform Expense</h2>
                    <p className="text-xs text-[#757575]">
                      Log a SaaS operational disbursement, AWS bill, or PayMongo interchange invoice.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddExpenseOpen(false)}
                    className="w-9 h-9 rounded-full bg-[#F3F3F3] hover:bg-[#EAEAEA] flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleAddExpenseSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Category Field with Justify-Between Button */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#1A1A1A]">
                        Expense Category <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomCategoryMode(!customCategoryMode)}
                        className="text-[11px] font-semibold text-[#D63C1E] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{customCategoryMode ? "Choose Existing Category" : "Add Other Category"}</span>
                      </button>
                    </div>

                    {customCategoryMode ? (
                      <input
                        type="text"
                        required
                        placeholder="Type new category name (e.g. Server Maintenance, PR & Events)..."
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs text-[#1A1A1A] placeholder:text-[#757575] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                      />
                    ) : (
                      <select
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Status Dropdown Field with Justify-Between Button */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#1A1A1A]">
                        Disbursement / Audit Status <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomStatusMode(!customStatusMode)}
                        className="text-[11px] font-semibold text-[#D63C1E] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{customStatusMode ? "Choose Existing Status" : "Add Other Status"}</span>
                      </button>
                    </div>

                    {customStatusMode ? (
                      <input
                        type="text"
                        required
                        placeholder="Type new custom status (e.g. Under Review, Scheduled, Disputed)..."
                        value={customStatusInput}
                        onChange={(e) => setCustomStatusInput(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs text-[#1A1A1A] placeholder:text-[#757575] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                      />
                    ) : (
                      <select
                        value={newExpense.status}
                        onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                      >
                        {statusesList.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                      Vendor / Payee Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amazon Web Services, PayMongo, KMC BGC"
                      value={newExpense.vendor}
                      onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs text-[#1A1A1A] placeholder:text-[#757575] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                        Amount in PHP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="25000.00"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs text-[#1A1A1A] placeholder:text-[#757575] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                        Reference / Invoice #
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. INV-99210"
                        value={newExpense.referenceNo}
                        onChange={(e) => setNewExpense({ ...newExpense, referenceNo: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs text-[#1A1A1A] placeholder:text-[#757575] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                      Description / Memo
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Purpose of platform disbursement, billing cycle..."
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs text-[#1A1A1A] placeholder:text-[#757575] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                    />
                  </div>

                  {/* Sticky Footer Inside Form */}
                  <div className="pt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setAddExpenseOpen(false)}
                      className="px-5 h-11 rounded-full text-xs font-semibold text-[#757575] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 h-11 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      Save Disbursement
                    </button>
                  </div>
                </form>
              </motion.aside>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          SIDE MODAL 5: EDIT EXPENSE (SLIDES FROM RIGHT)
         ======================================================== */}
      <AnimatePresence>
        {editingExpense && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setEditingExpense(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Slide-out Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 350 }}
                className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-[#EAEAEA]"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between bg-[#FDFDFD]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D63C1E]/10 flex items-center justify-center text-[#D63C1E]">
                      <Pencil className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#1A1A1A]">Edit Platform Expense</h2>
                      <p className="text-xs text-[#757575] font-mono">{editingExpense.id} • {editingExpense.referenceNo}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingExpense(null)}
                    className="w-9 h-9 rounded-full bg-[#F3F3F3] hover:bg-[#EAEAEA] flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleEditExpenseSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Category Field with Justify-Between Button */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#1A1A1A]">
                        Expense Category <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditCustomCategoryMode(!editCustomCategoryMode)}
                        className="text-[11px] font-semibold text-[#D63C1E] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{editCustomCategoryMode ? "Choose Existing Category" : "Add Other Category"}</span>
                      </button>
                    </div>

                    {editCustomCategoryMode ? (
                      <input
                        type="text"
                        required
                        placeholder="Type new category name..."
                        value={editCustomCategoryInput}
                        onChange={(e) => setEditCustomCategoryInput(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs text-[#1A1A1A] placeholder:text-[#757575] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                      />
                    ) : (
                      <select
                        value={editingExpense.category}
                        onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Status Dropdown Field with Justify-Between Button */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#1A1A1A]">
                        Disbursement / Audit Status <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditCustomStatusMode(!editCustomStatusMode)}
                        className="text-[11px] font-semibold text-[#D63C1E] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{editCustomStatusMode ? "Choose Existing Status" : "Add Other Status"}</span>
                      </button>
                    </div>

                    {editCustomStatusMode ? (
                      <input
                        type="text"
                        required
                        placeholder="Type new custom status..."
                        value={editCustomStatusInput}
                        onChange={(e) => setEditCustomStatusInput(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs text-[#1A1A1A] placeholder:text-[#757575] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                      />
                    ) : (
                      <select
                        value={editingExpense.status}
                        onChange={(e) => setEditingExpense({ ...editingExpense, status: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                      >
                        {statusesList.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                      Vendor / Payee Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingExpense.vendor}
                      onChange={(e) => setEditingExpense({ ...editingExpense, vendor: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                        Amount in PHP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={Math.abs(editingExpense.amount)}
                        onChange={(e) =>
                          setEditingExpense({
                            ...editingExpense,
                            amount: -Math.abs(parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                        Reference / Invoice #
                      </label>
                      <input
                        type="text"
                        value={editingExpense.referenceNo}
                        onChange={(e) => setEditingExpense({ ...editingExpense, referenceNo: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                      Description / Memo
                    </label>
                    <textarea
                      rows={3}
                      value={editingExpense.description}
                      onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D63C1E]/30"
                    />
                  </div>

                  {/* Form Footer */}
                  <div className="pt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingExpense(null)}
                      className="px-5 h-11 rounded-full text-xs font-semibold text-[#757575] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 h-11 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      Save Changes
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

export default function SalesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center text-sm text-[#757575]">
          Loading Subscriptions & Sales...
        </div>
      }
    >
      <SalesPageContent />
    </Suspense>
  );
}
