"use client";

import { useState, useMemo, useEffect } from "react";
import {
  FileBarChart2,
  Calendar,
  Download,
  Plus,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Inbox,
  User,
  Users,
  Store,
  Tag,
  Paperclip,
  Send,
  MessageSquare,
  ShieldAlert,
  ArrowUpRight,
  X,
  FileSpreadsheet,
  SlidersHorizontal,
  FileText,
  Printer,
  Sparkles,
  Zap,
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

// ====================================================================
// TYPES & CARD DEFINITIONS
// ====================================================================

export type TicketPriority = "High" | "Medium" | "Low";
export type TicketStatus = "Pending" | "In Progress" | "Solved";
export type TicketCategory =
  | "POS Sync & Offline Queue"
  | "Hardware & Printer"
  | "Payment & QRPh Mismatch"
  | "Account & Session Lock"
  | "BIR & Tax Compliance"
  | "Inventory Stock Delta";

export interface PositionDetail {
  name: string;
  initials: string;
  department: string;
  description: string;
  colorClass: string;
}

export const POSITION_DETAILS: PositionDetail[] = [
  {
    name: "Tech Support Team A (Tier 1)",
    initials: "TS",
    department: "Tier 1 Support",
    description: "Frontline cashier triage, shift PINs & network drops",
    colorClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    name: "Tech Support Team B (Hardware & Printer)",
    initials: "TB",
    department: "Hardware Labs",
    description: "Thermal printer ESC/POS, Bluetooth & cash drawers",
    colorClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    name: "Tier 2 Escalations (Engineering)",
    initials: "TE",
    department: "Core Engineering",
    description: "Database sync anomalies, WebSocket lag & API bugs",
    colorClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    name: "Billing & Payment Operations",
    initials: "BP",
    department: "Finance & Webhooks",
    description: "PayMongo QRPh, subscription renewals & invoice VAT",
    colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    name: "Field Operations Specialist",
    initials: "FO",
    department: "Field Deployment",
    description: "Physical branch hardware dispatch & technician visits",
    colorClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    name: "Database & Infrastructure Admin",
    initials: "DB",
    department: "DevOps & Cloud",
    description: "Supabase connection pool, pgBouncer & cluster latency",
    colorClass: "bg-red-50 text-red-700 border-red-200",
  },
];

export const SUPPORT_POSITIONS = POSITION_DETAILS.map((p) => p.name);

export const getPositionInitials = (pos: string) => {
  const match = POSITION_DETAILS.find((p) => p.name === pos);
  if (match) return match.initials;
  const words = pos.replace(/[()]/g, "").split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return pos.slice(0, 2).toUpperCase();
};

// Dropdown Cards: Priority
export const PRIORITY_CARD_OPTIONS = [
  {
    value: "All",
    label: "All Priorities",
    desc: "Show all tickets across high, medium, and low urgency",
    bg: "bg-[#F5F5F5] text-[#1A1A1A]",
    icon: <Filter className="w-4 h-4 text-[#757575]" />,
  },
  {
    value: "High",
    label: "High Priority",
    desc: "POS checkout stoppage, offline queue stall or payment error",
    bg: "bg-red-50 text-red-600",
    icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
  },
  {
    value: "Medium",
    label: "Medium Priority",
    desc: "Hardware printer driver lag or non-blocking stock delta",
    bg: "bg-amber-50 text-amber-600",
    icon: <Clock className="w-4 h-4 text-amber-600" />,
  },
  {
    value: "Low",
    label: "Low Priority",
    desc: "General configuration inquiries, Senior Citizen tax math",
    bg: "bg-gray-100 text-gray-700",
    icon: <Inbox className="w-4 h-4 text-gray-600" />,
  },
];

// Dropdown Cards: Status Filter
export const STATUS_CARD_OPTIONS = [
  {
    value: "All",
    label: "All Statuses",
    desc: "View tickets regardless of current resolution state",
    bg: "bg-[#F5F5F5] text-[#1A1A1A]",
    icon: <Inbox className="w-4 h-4 text-[#757575]" />,
  },
  {
    value: "Pending",
    label: "Pending Triage",
    desc: "Newly filed tickets waiting for initial support review",
    bg: "bg-amber-50 text-amber-600",
    icon: <Clock className="w-4 h-4 text-amber-600" />,
  },
  {
    value: "In Progress",
    label: "In Progress",
    desc: "Assigned specialist actively investigating the problem",
    bg: "bg-blue-50 text-blue-600",
    icon: <Sparkles className="w-4 h-4 text-blue-600" />,
  },
  {
    value: "Solved",
    label: "Solved & Verified",
    desc: "Resolved issues with verified solutions & merchant notes",
    bg: "bg-emerald-50 text-emerald-600",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
];

// Dropdown Cards: Category Filter
export const CATEGORY_CARD_OPTIONS = [
  {
    value: "All",
    label: "All Categories",
    desc: "Display issues across all hardware, software & compliance areas",
    icon: <SlidersHorizontal className="w-4 h-4 text-[#757575]" />,
  },
  {
    value: "POS Sync & Offline Queue",
    label: "POS Sync & Offline Queue",
    desc: "Delta synchronization, WebSocket reconnects & store queue lag",
    icon: <Zap className="w-4 h-4 text-[#D63C1E]" />,
  },
  {
    value: "Hardware & Printer",
    label: "Hardware & Printer",
    desc: "Bluetooth 58mm thermal printers, cash drawers & barcode readers",
    icon: <Printer className="w-4 h-4 text-blue-600" />,
  },
  {
    value: "Payment & QRPh Mismatch",
    label: "Payment & QRPh Mismatch",
    desc: "PayMongo QRPh, GCash & Maya webhook status reconciliation",
    icon: <Tag className="w-4 h-4 text-emerald-600" />,
  },
  {
    value: "Account & Session Lock",
    label: "Account & Session Lock",
    desc: "Single-device lockouts (user_device_sessions) & cashier PINs",
    icon: <ShieldAlert className="w-4 h-4 text-purple-600" />,
  },
  {
    value: "BIR & Tax Compliance",
    label: "BIR & Tax Compliance",
    desc: "12% VAT calculations, CAS audit compliance & SC/PWD discounts",
    icon: <FileText className="w-4 h-4 text-amber-600" />,
  },
  {
    value: "Inventory Stock Delta",
    label: "Inventory Stock Delta",
    desc: "Negative stock warnings, multi-pack bundles & unit multipliers",
    icon: <Store className="w-4 h-4 text-indigo-600" />,
  },
];

// Dropdown Cards: Mark As Status in Side Modal
export const STATUS_UPDATE_CARDS = [
  {
    value: "Pending" as TicketStatus,
    title: "Pending Triage",
    desc: "Awaiting engineer pickup & diagnostic reproduction",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="w-4 h-4 text-amber-600" />,
  },
  {
    value: "In Progress" as TicketStatus,
    title: "In Progress",
    desc: "Assigned specialist actively investigating & testing fix",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <Sparkles className="w-4 h-4 text-blue-600" />,
  },
  {
    value: "Solved" as TicketStatus,
    title: "Mark as Solved",
    desc: "Remediation verified with merchant store cashier",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
];

export interface IncidentReport {
  id: string; // RPT-2024-XXXX
  reporterName: string;
  reporterInitials: string;
  reporterRole: string;
  storeName: string;
  branch: string;
  contactNumber: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgent: string;
  assignedAgentInitials: string;
  createdAt: string;
  updatedAt: string;
  subject: string;
  description: string;
  deviceModel: string;
  appVersion: string;
  resolutionNotes?: string;
  activityLog: {
    timestamp: string;
    actor: string;
    action: string;
  }[];
}

// Initial Mock Incidents
const INITIAL_REPORTS: IncidentReport[] = [
  {
    id: "RPT-2024-1082",
    reporterName: "Maria Santos",
    reporterInitials: "MS",
    reporterRole: "Store Owner",
    storeName: "Santos Mini Mart",
    branch: "Makati Branch",
    contactNumber: "+63 917 555 0192",
    category: "POS Sync & Offline Queue",
    priority: "High",
    status: "Pending",
    assignedAgent: "Tech Support Team A (Tier 1)",
    assignedAgentInitials: "TS",
    createdAt: "Today, 10:45 AM",
    updatedAt: "15m ago",
    subject: "Offline queue not auto-draining after reconnecting to Wi-Fi",
    description:
      "Cashier terminal accumulated 28 offline sales transactions during lunch peak. Wi-Fi reconnected, but cloud dashboard still shows pending delta count.",
    deviceModel: "Samsung Galaxy A14",
    appVersion: "1.0.0",
    activityLog: [
      { timestamp: "10:45 AM", actor: "Maria Santos", action: "Ticket logged via in-app help desk." },
      { timestamp: "10:50 AM", actor: "System", action: "Assigned to Tech Support Team A (High Priority Queue)." },
    ],
  },
  {
    id: "RPT-2024-1083",
    reporterName: "David Vance",
    reporterInitials: "DV",
    reporterRole: "Store Manager",
    storeName: "Vance Gourmet Provisions",
    branch: "BGC Flagship",
    contactNumber: "+63 928 555 8821",
    category: "Payment & QRPh Mismatch",
    priority: "High",
    status: "In Progress",
    assignedAgent: "Tier 2 Escalations (Engineering)",
    assignedAgentInitials: "TE",
    createdAt: "Today, 09:15 AM",
    updatedAt: "32m ago",
    subject: "PayMongo QRPh dynamic payment captured but cashier marked unpaid",
    description:
      "Customer paid ₱1,250.00 via GCash QRPh. GCash issued SMS confirmation ref 994821, but terminal timed out before webhook acknowledgment arrived.",
    deviceModel: "Xiaomi Redmi Note 12",
    appVersion: "1.0.0",
    resolutionNotes: "Verifying PayMongo transaction ref against webhook ledger.",
    activityLog: [
      { timestamp: "09:15 AM", actor: "David Vance", action: "Ticket opened with payment screenshot attached." },
      { timestamp: "09:22 AM", actor: "Kevin Tan", action: "Picked up investigation. Webhook logs inspected." },
    ],
  },
  {
    id: "RPT-2024-1084",
    reporterName: "Alex Johnson",
    reporterInitials: "AJ",
    reporterRole: "Supervisor",
    storeName: "Johnson Wholesalers",
    branch: "Cebu Central",
    contactNumber: "+63 919 555 4310",
    category: "Hardware & Printer",
    priority: "Medium",
    status: "Solved",
    assignedAgent: "Tech Support Team B (Hardware & Printer)",
    assignedAgentInitials: "TB",
    createdAt: "Today, 08:30 AM",
    updatedAt: "1h ago",
    subject: "58mm Bluetooth thermal printer fails ESC/POS character encoding",
    description:
      "Receipt prints question marks on Peso symbol (₱) and long item descriptions are clipped.",
    deviceModel: "Oppo A58 4G",
    appVersion: "1.0.0",
    resolutionNotes: "Switched printer encoding profile to UTF-8 / CP852 in app printer settings.",
    activityLog: [
      { timestamp: "08:30 AM", actor: "Alex Johnson", action: "Report filed." },
      { timestamp: "08:45 AM", actor: "Sarah Miller", action: "Provided Bluetooth baud rate & UTF-8 guide." },
      { timestamp: "09:10 AM", actor: "Alex Johnson", action: "Tested successfully. Ticket marked Solved." },
    ],
  },
  {
    id: "RPT-2024-1085",
    reporterName: "Clara Lim",
    reporterInitials: "CL",
    reporterRole: "Cashier Lead",
    storeName: "Lim Sari-Sari & Rice Hub",
    branch: "Quezon City Hub",
    contactNumber: "+63 922 555 9012",
    category: "Account & Session Lock",
    priority: "Low",
    status: "Solved",
    assignedAgent: "Tech Support Team A (Tier 1)",
    assignedAgentInitials: "TS",
    createdAt: "Today, 07:45 AM",
    updatedAt: "2h ago",
    subject: "Single-device lock triggered after cashier phone battery died",
    description:
      "Attempted to log in using alternate spare tablet while primary phone was recharging.",
    deviceModel: "Realme C55",
    appVersion: "1.0.0",
    resolutionNotes: "Merchant waited 5 minutes for session TTL expiry and logged in normally.",
    activityLog: [
      { timestamp: "07:45 AM", actor: "Clara Lim", action: "Login lock reported." },
      { timestamp: "08:00 AM", actor: "Clara Lim", action: "Successfully authenticated after session reset." },
    ],
  },
  {
    id: "RPT-2024-1086",
    reporterName: "Kenneth Wayne",
    reporterInitials: "KW",
    reporterRole: "Store Owner",
    storeName: "Wayne Auto & Hardware",
    branch: "Pasig Branch",
    contactNumber: "+63 939 555 7714",
    category: "Inventory Stock Delta",
    priority: "Medium",
    status: "In Progress",
    assignedAgent: "Billing & Payment Operations",
    assignedAgentInitials: "BP",
    createdAt: "Today, 11:10 AM",
    updatedAt: "45m ago",
    subject: "Negative stock quantity warning triggered on barcode bundle sale",
    description:
      "Sold 3-pack 10W-40 oil pack. Master stock deducted 3 units, but branch stock shows -1.",
    deviceModel: "Samsung Galaxy Tab A8",
    appVersion: "1.0.0",
    resolutionNotes: "Recalculating unit multiplier in composite item table.",
    activityLog: [
      { timestamp: "11:10 AM", actor: "Kenneth Wayne", action: "Report created." },
      { timestamp: "11:25 AM", actor: "Kevin Tan", action: "Auditing bundle breakdown rules." },
    ],
  },
  {
    id: "RPT-2024-1087",
    reporterName: "Isla Romero",
    reporterInitials: "IR",
    reporterRole: "Branch Cashier",
    storeName: "Romero Delicacies",
    branch: "Alabang Mall",
    contactNumber: "+63 908 555 3341",
    category: "BIR & Tax Compliance",
    priority: "Low",
    status: "Solved",
    assignedAgent: "Billing & Payment Operations",
    assignedAgentInitials: "BP",
    createdAt: "Yesterday, 04:30 PM",
    updatedAt: "Yesterday",
    subject: "Senior Citizen / PWD 20% discount calculation breakdown",
    description:
      "Merchant requested clarification regarding VAT-exempt base price calculation on mixed receipts.",
    deviceModel: "Vivo Y17s",
    appVersion: "1.0.0",
    resolutionNotes: "Provided Philippine BIR Revenue Regulation compliant calculation sheet.",
    activityLog: [
      { timestamp: "04:30 PM", actor: "Isla Romero", action: "Query submitted." },
      { timestamp: "05:00 PM", actor: "Sarah Miller", action: "Explanation and BIR formula dispatched." },
    ],
  },
  {
    id: "RPT-2024-1088",
    reporterName: "George Sy",
    reporterInitials: "GS",
    reporterRole: "Store Owner",
    storeName: "Sy Poultry Supply",
    branch: "Davao Store",
    contactNumber: "+63 918 555 2209",
    category: "POS Sync & Offline Queue",
    priority: "High",
    status: "Pending",
    assignedAgent: "Tech Support Team A (Tier 1)",
    assignedAgentInitials: "TS",
    createdAt: "Today, 11:55 AM",
    updatedAt: "10m ago",
    subject: "Terminal displays WebSocket connection closed (Code 1006)",
    description:
      "Davao store encountering intermittent telco packet loss causing rapid reconnect loops.",
    deviceModel: "Tecno Spark 10 Pro",
    appVersion: "1.0.0",
    activityLog: [
      { timestamp: "11:55 AM", actor: "George Sy", action: "Automated error log dispatch triggered." },
    ],
  },
  {
    id: "RPT-2024-1089",
    reporterName: "Elena Cruz",
    reporterInitials: "EC",
    reporterRole: "Store Owner",
    storeName: "Cruz Agrivet",
    branch: "Ortigas Mall",
    contactNumber: "+63 927 555 6672",
    category: "Payment & QRPh Mismatch",
    priority: "Medium",
    status: "Solved",
    assignedAgent: "Billing & Payment Operations",
    assignedAgentInitials: "BP",
    createdAt: "Yesterday, 02:15 PM",
    updatedAt: "Yesterday",
    subject: "Maya checkout redirect returned expired session error",
    description:
      "Customer QR session timed out after 10 minutes on slow mobile data connection.",
    deviceModel: "Samsung Galaxy A05",
    appVersion: "1.0.0",
    resolutionNotes: "Advised cashier to generate fresh dynamic QR code for transactions exceeding 5m.",
    activityLog: [
      { timestamp: "02:15 PM", actor: "Elena Cruz", action: "Ticket logged." },
      { timestamp: "02:40 PM", actor: "Kevin Tan", action: "Timeout parameters explained." },
    ],
  },
];

export default function ReportsPage() {
  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Data state
  const [reports, setReports] = useState<IncidentReport[]>(INITIAL_REPORTS);

  // Side Modal States (STRICT RULE: All tables must have side modal only)
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [newReportModalOpen, setNewReportModalOpen] = useState(false);

  // New Report Form State (including Assigned to: Position)
  const [newReporterName, setNewReporterName] = useState("");
  const [newStoreName, setNewStoreName] = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [newCategory, setNewCategory] = useState<TicketCategory>("POS Sync & Offline Queue");
  const [newPriority, setNewPriority] = useState<TicketPriority>("Medium");
  const [newAssignedPosition, setNewAssignedPosition] = useState<string>(SUPPORT_POSITIONS[0]);
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Lock body scroll when any side modal is open
  useEffect(() => {
    const isModalOpen = selectedReport !== null || newReportModalOpen;
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedReport, newReportModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedReport(null);
        setNewReportModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchesSearch =
        rep.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || rep.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === "All" || rep.category === categoryFilter;

      const matchesPriority =
        priorityFilter === "All" || rep.priority.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [reports, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  // Paginated reports
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / itemsPerPage));

  // Export current reports table to CSV
  const handleExportIncidentCSV = () => {
    const exportData = filteredReports.map((r) => ({
      "Ticket ID": r.id,
      "Reporter Name": r.reporterName,
      "Role": r.reporterRole,
      "Store Name": r.storeName,
      "Branch": r.branch,
      "Contact": r.contactNumber,
      "Category": r.category,
      "Priority": r.priority,
      "Status": r.status,
      "Assigned Agent": r.assignedAgent,
      "Subject": r.subject,
      "Device": r.deviceModel,
      "App Version": r.appVersion,
      "Created At": r.createdAt,
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `myshop_incident_reports_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Incident Ledger Exported", {
      description: `${exportData.length} support ticket records exported to CSV.`,
    });
  };

  // Submit New Report
  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReporterName.trim() || !newStoreName.trim() || !newSubject.trim()) {
      toast.error("Missing Required Fields", {
        description: "Please provide the reporter name, store, and issue subject.",
      });
      return;
    }

    const newTicket: IncidentReport = {
      id: `RPT-2024-${Math.floor(1090 + Math.random() * 900)}`,
      reporterName: newReporterName,
      reporterInitials: newReporterName.slice(0, 2).toUpperCase(),
      reporterRole: "Store Operator",
      storeName: newStoreName,
      branch: newBranch || "Main Branch",
      contactNumber: "+63 900 000 0000",
      category: newCategory,
      priority: newPriority,
      status: "Pending",
      assignedAgent: newAssignedPosition,
      assignedAgentInitials: getPositionInitials(newAssignedPosition),
      createdAt: "Just now",
      updatedAt: "Just now",
      subject: newSubject,
      description: newDescription || "No detailed description provided.",
      deviceModel: "Android POS Terminal",
      appVersion: "1.0.0",
      activityLog: [
        {
          timestamp: "Just now",
          actor: "Admin Operator",
          action: `Ticket created and assigned to ${newAssignedPosition}.`,
        },
      ],
    };

    setReports([newTicket, ...reports]);
    setNewReportModalOpen(false);
    setSelectedReport(newTicket);

    // Reset fields
    setNewReporterName("");
    setNewStoreName("");
    setNewBranch("");
    setNewSubject("");
    setNewDescription("");
    setNewAssignedPosition(SUPPORT_POSITIONS[0]);

    toast.success("Incident Ticket Created", {
      description: `Ticket ${newTicket.id} has been queued for ${newAssignedPosition}.`,
    });
  };

  // Update Status in side modal via Dropdown Card
  const handleUpdateStatus = (ticket: IncidentReport, newStatus: TicketStatus) => {
    const updated = {
      ...ticket,
      status: newStatus,
      updatedAt: "Just now",
      activityLog: [
        {
          timestamp: "Just now",
          actor: "Super Admin",
          action: `Status marked as: ${newStatus}.`,
        },
        ...ticket.activityLog,
      ],
    };

    setReports((prev) => prev.map((r) => (r.id === ticket.id ? updated : r)));
    setSelectedReport(updated);

    toast.success(`Ticket Status Changed to ${newStatus}`, {
      description: `Reference ${ticket.id} marked as ${newStatus}.`,
    });
  };

  // Transfer Report to Position in side modal via Dropdown Card
  const handleTransferReport = (ticket: IncidentReport, newPosition: string) => {
    const updated = {
      ...ticket,
      assignedAgent: newPosition,
      assignedAgentInitials: getPositionInitials(newPosition),
      updatedAt: "Just now",
      activityLog: [
        {
          timestamp: "Just now",
          actor: "Super Admin",
          action: `Report transferred to: ${newPosition}.`,
        },
        ...ticket.activityLog,
      ],
    };

    setReports((prev) => prev.map((r) => (r.id === ticket.id ? updated : r)));
    setSelectedReport(updated);

    toast.success("Report Transferred", {
      description: `Ticket ${ticket.id} transferred to ${newPosition}.`,
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
          title="Reports & Incident Management"
          onOpenMobile={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 pt-20 px-4 sm:px-6 md:px-8 pb-12 max-w-[1600px] w-full mx-auto">
          {/* Header & Quick Action Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                Reports & Incident Management
              </h1>
              <p className="text-xs sm:text-sm text-[#757575] mt-1">
                Real-time incident tracking, hardware escalations, and store operational logs.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportIncidentCSV}
                className="h-11 px-4 rounded-full bg-white hover:bg-[#F3F3F3] text-[#1A1A1A] text-xs font-semibold border border-[#EAEAEA] shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-[#757575]" />
                <span>Export CSV</span>
              </button>

              {/* File New Report Button */}
              <button
                type="button"
                onClick={() => setNewReportModalOpen(true)}
                className="h-11 px-5 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>File New Report</span>
              </button>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* KPI 1: Total Reports Today */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider block">
                    Total Reports Today
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-[#1A1A1A]">128</span>
                    <span className="text-xs font-medium text-emerald-600">+12% vs yesterday</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#565F6D]">
                  <Inbox className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-[11px] text-[#757575]">
                <span>All merchant stores</span>
                <span className="font-semibold text-[#1A1A1A]">100% triage logged</span>
              </div>
            </div>

            {/* KPI 2: Total Solved Today */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider block">
                    Total Solved Today
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-[#1A1A1A]">94</span>
                    <span className="text-xs font-medium text-emerald-600">73.4% SLA</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-[11px] text-[#757575]">
                <span>Avg resolution time</span>
                <span className="font-semibold text-emerald-600">24 mins</span>
              </div>
            </div>

            {/* KPI 3: Total Pending */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider block">
                    Total Pending
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-[#1A1A1A]">34</span>
                    <span className="text-xs font-medium text-amber-600">8 High Priority</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-[11px] text-[#757575]">
                <span>Escalated to Tier 2</span>
                <span className="font-semibold text-[#D63C1E]">4 in progress</span>
              </div>
            </div>
          </div>

          {/* Clean Filter Toolbar with Card Dropdowns */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Incident & Issue Reports</h2>
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
                  placeholder="Search ticket ID, branch, reporter..."
                  className="w-full h-10 pl-9 pr-4 rounded-full bg-white border border-[#EAEAEA] text-xs text-[#1A1A1A] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#D63C1E] shadow-xs transition-all"
                />
              </div>

              {/* Priority Dropdown Cards */}
              <DropdownMenu>
                <DropdownMenuTrigger className="h-10 px-4 rounded-full bg-white border border-[#EAEAEA] text-xs font-medium text-[#1A1A1A] flex items-center gap-2 shadow-xs hover:bg-[#F9F9F9] cursor-pointer transition-all">
                  <Filter className="w-3.5 h-3.5 text-[#757575]" />
                  <span>Priority: <strong className="text-[#1A1A1A]">{priorityFilter}</strong></span>
                  <ChevronDown className="w-3 h-3 text-[#757575]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 rounded-2xl p-2 bg-white shadow-xl border border-[#EAEAEA] z-50 space-y-1"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                    Filter By Priority
                  </div>
                  {PRIORITY_CARD_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => {
                        setPriorityFilter(opt.value);
                        setCurrentPage(1);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                        priorityFilter === opt.value
                          ? "bg-[#D63C1E]/5 border border-[#D63C1E]/20"
                          : "hover:bg-[#F5F5F5] border border-transparent"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${opt.bg}`}>
                        {opt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#1A1A1A]">{opt.label}</span>
                          {priorityFilter === opt.value && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D63C1E]" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#757575] leading-snug mt-0.5">{opt.desc}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Status Dropdown Cards */}
              <DropdownMenu>
                <DropdownMenuTrigger className="h-10 px-4 rounded-full bg-white border border-[#EAEAEA] text-xs font-medium text-[#1A1A1A] flex items-center gap-2 shadow-xs hover:bg-[#F9F9F9] cursor-pointer transition-all">
                  <Filter className="w-3.5 h-3.5 text-[#757575]" />
                  <span>Status: <strong className="text-[#1A1A1A]">{statusFilter}</strong></span>
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
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${opt.bg}`}>
                        {opt.icon}
                      </div>
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

              {/* Category Dropdown Cards */}
              <DropdownMenu>
                <DropdownMenuTrigger className="h-10 px-4 rounded-full bg-white border border-[#EAEAEA] text-xs font-medium text-[#1A1A1A] flex items-center gap-2 shadow-xs hover:bg-[#F9F9F9] cursor-pointer transition-all">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#757575]" />
                  <span>Category: <strong className="text-[#1A1A1A]">{categoryFilter}</strong></span>
                  <ChevronDown className="w-3 h-3 text-[#757575]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-84 sm:w-96 rounded-2xl p-2 bg-white shadow-xl border border-[#EAEAEA] z-50 space-y-1 max-h-[420px] overflow-y-auto"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                    Filter By Issue Category
                  </div>
                  {CATEGORY_CARD_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => {
                        setCategoryFilter(opt.value);
                        setCurrentPage(1);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                        categoryFilter === opt.value
                          ? "bg-[#D63C1E]/5 border border-[#D63C1E]/20"
                          : "hover:bg-[#F5F5F5] border border-transparent"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center shrink-0">
                        {opt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#1A1A1A]">{opt.label}</span>
                          {categoryFilter === opt.value && (
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
              INCIDENT & ISSUE REPORTS TABLE
             ======================================================== */}
          <div className="bg-white rounded-3xl border border-[#EAEAEA] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F0F0F0] text-[#757575] text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6">Ticket ID</th>
                    <th className="py-3.5 px-4">Reported By</th>
                    <th className="py-3.5 px-4">Branch</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Assigned Agent</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F7F7]">
                  {paginatedReports.length > 0 ? (
                    paginatedReports.map((report) => (
                      <tr
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className="hover:bg-[#F9F9F9] transition-colors group cursor-pointer"
                      >
                        {/* Clean Ticket ID */}
                        <td className="py-4 px-6 text-xs font-bold text-[#1A1A1A] whitespace-nowrap">
                          <span className="font-mono">{report.id}</span>
                        </td>

                        {/* Reported By (Clean Name with Avatar) */}
                        <td className="py-4 px-4 text-xs font-semibold text-[#1A1A1A] whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#D63C1E]/10 text-[#D63C1E] font-bold text-[11px] flex items-center justify-center shrink-0">
                              {report.reporterInitials}
                            </div>
                            <span>{report.reporterName}</span>
                          </div>
                        </td>

                        {/* Clean Branch column (No phone numbers) */}
                        <td className="py-4 px-4 text-xs text-[#565F6D] font-medium whitespace-nowrap">
                          {report.branch}
                        </td>

                        {/* Priority Pill */}
                        <td className="py-4 px-4 text-xs whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              report.priority === "High"
                                ? "bg-red-50 text-red-700"
                                : report.priority === "Medium"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {report.priority}
                          </span>
                        </td>

                        {/* Status Pill */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                              report.status === "Solved"
                                ? "bg-emerald-50 text-emerald-700"
                                : report.status === "In Progress"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{report.status}</span>
                          </span>
                        </td>

                        {/* Assigned Agent */}
                        <td className="py-4 px-4 text-xs text-[#565F6D] whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#F0F0F0] text-[#757575] font-semibold text-[10px] flex items-center justify-center shrink-0">
                              {report.assignedAgentInitials}
                            </div>
                            <span className="font-medium text-[#1A1A1A] truncate max-w-[180px]">
                              {report.assignedAgent}
                            </span>
                          </div>
                        </td>

                        {/* Action Button: Pure Chevron Button */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReport(report);
                            }}
                            className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] transition-all cursor-pointer"
                            title="View Report Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-[#757575]">
                        No incident reports match your current filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Footer */}
            <div className="py-4 px-6 border-t border-[#F5F5F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#757575]">
              <div>
                Showing <span className="font-semibold text-[#1A1A1A]">{paginatedReports.length}</span> of{" "}
                <span className="font-semibold text-[#1A1A1A]">{filteredReports.length}</span> reports
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
          SIDE MODAL 1: REPORT INSPECTION & TRIAGE (SLIDES FROM RIGHT)
         ======================================================== */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedReport(null)}
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
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1A1A]">{selectedReport.id}</h3>
                      <p className="text-xs text-[#757575]">{selectedReport.category}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#757575] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                  {/* Status & Priority Badge Strip */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#757575] block">Current Status</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                          selectedReport.status === "Solved"
                            ? "bg-emerald-50 text-emerald-700"
                            : selectedReport.status === "In Progress"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {selectedReport.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#757575] block">Ticket Priority</span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                          selectedReport.priority === "High"
                            ? "bg-red-50 text-red-700"
                            : selectedReport.priority === "Medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedReport.priority}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#757575] block">Assigned Position</span>
                      <span className="font-semibold text-[#1A1A1A] block mt-1 truncate max-w-[140px]">
                        {selectedReport.assignedAgent}
                      </span>
                    </div>
                  </div>

                  {/* Merchant Subscriber Profile */}
                  <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] space-y-2.5">
                    <div className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider text-[#757575]">
                      Merchant Subscriber Profile
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                      <span className="text-[#757575]">Full Name:</span>
                      <span className="font-bold text-[#1A1A1A]">{selectedReport.reporterName}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#757575]">Contact Info:</span>
                      <span className="font-semibold text-[#1A1A1A]">{selectedReport.contactNumber}</span>
                    </div>
                  </div>

                  {/* Incident & Issue Details Card */}
                  <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] space-y-2.5">
                    <div className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider text-[#757575]">
                      Incident Report Details
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#F5F5F5]">
                      <span className="text-[#757575]">Issue Category:</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5F5F5] font-semibold text-[#1A1A1A] text-[11px]">
                        <Tag className="w-3 h-3 text-[#D63C1E]" />
                        {selectedReport.category}
                      </span>
                    </div>
                    <div className="flex justify-between items-start py-1 border-b border-[#F5F5F5] gap-4">
                      <span className="text-[#757575] shrink-0">Subject Summary:</span>
                      <span className="font-bold text-[#1A1A1A] text-right">{selectedReport.subject}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                      <span className="text-[#757575]">Store Name:</span>
                      <span className="font-semibold text-[#1A1A1A]">{selectedReport.storeName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                      <span className="text-[#757575]">Branch:</span>
                      <span className="font-semibold text-[#1A1A1A]">{selectedReport.branch}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-[#757575] block mb-1.5">Details:</span>
                      <div className="text-[#1A1A1A] leading-relaxed font-medium">
                        {selectedReport.description}
                      </div>
                    </div>
                  </div>

                  {/* Hardware & App Version Diagnostic */}
                  <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#757575]">Terminal Device</div>
                      <div className="font-semibold text-[#1A1A1A]">{selectedReport.deviceModel}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#757575]">App Build</div>
                      <div className="font-bold text-[#D63C1E]">v{selectedReport.appVersion}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#757575]">Logged At</div>
                      <div className="font-semibold text-[#1A1A1A]">{selectedReport.createdAt}</div>
                    </div>
                  </div>

                  {/* Activity & SLA Timeline */}
                  <div>
                    <h4 className="font-bold text-[#1A1A1A] mb-2.5">Resolution & Activity Timeline</h4>
                    <div className="space-y-2.5">
                      {selectedReport.activityLog.map((act, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-[#EAEAEA] bg-white flex items-start justify-between gap-3"
                        >
                          <div>
                            <div className="font-bold text-[#1A1A1A]">{act.actor}</div>
                            <div className="text-[11px] text-[#757575] mt-0.5">{act.action}</div>
                          </div>
                          <span className="text-[10px] font-mono text-[#757575] shrink-0">{act.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Status Triage & Transfer (with Dropdown Cards) */}
                <div className="p-5 border-t border-[#EAEAEA] bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Mark as: Dropdown Card */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-10 px-4 rounded-full border border-[#EAEAEA] bg-white text-xs font-semibold text-[#1A1A1A] hover:bg-[#F9F9F9] flex items-center gap-2 cursor-pointer shadow-xs transition-all">
                        <span className="text-[#757575]">Mark as:</span>
                        <span className="font-bold text-[#1A1A1A]">{selectedReport.status}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#757575]" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-80 rounded-2xl p-2 bg-white shadow-xl border border-[#EAEAEA] z-50 space-y-1.5"
                      >
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                          Update Ticket Status
                        </div>
                        {STATUS_UPDATE_CARDS.map((st) => (
                          <DropdownMenuItem
                            key={st.value}
                            onClick={() => handleUpdateStatus(selectedReport, st.value)}
                            className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                              selectedReport.status === st.value
                                ? "bg-[#D63C1E]/5 border border-[#D63C1E]/20"
                                : "hover:bg-[#F5F5F5] border border-transparent"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${st.badgeClass}`}>
                              {st.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-[#1A1A1A]">{st.title}</span>
                                {selectedReport.status === st.value && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D63C1E]" />
                                )}
                              </div>
                              <p className="text-[11px] text-[#757575] leading-snug mt-0.5">{st.desc}</p>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Transfer Report Button: (Position) Dropdown Card */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-10 px-4 rounded-full border border-[#EAEAEA] bg-white text-xs font-semibold text-[#1A1A1A] hover:bg-[#F9F9F9] flex items-center gap-2 cursor-pointer shadow-xs transition-all">
                        <Users className="w-3.5 h-3.5 text-[#757575]" />
                        <span>Transfer Report</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#757575]" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-84 sm:w-96 rounded-2xl p-2 bg-white shadow-xl border border-[#EAEAEA] z-50 space-y-1.5 max-h-[420px] overflow-y-auto"
                      >
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                          Transfer Ticket to Specialist Team
                        </div>
                        {POSITION_DETAILS.map((pos) => (
                          <DropdownMenuItem
                            key={pos.name}
                            onClick={() => handleTransferReport(selectedReport, pos.name)}
                            className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 border ${
                              selectedReport.assignedAgent === pos.name
                                ? "bg-[#D63C1E]/5 border-[#D63C1E]/30"
                                : "hover:bg-[#F5F5F5] border-transparent"
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${pos.colorClass}`}
                            >
                              {pos.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-[#1A1A1A] truncate">{pos.name}</span>
                                {selectedReport.assignedAgent === pos.name && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D63C1E] shrink-0 ml-1.5" />
                                )}
                              </div>
                              <div className="text-[10px] font-semibold text-[#D63C1E] mt-0.5">{pos.department}</div>
                              <p className="text-[11px] text-[#757575] leading-snug mt-0.5">{pos.description}</p>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Notify Merchant Button */}
                  <button
                    type="button"
                    onClick={() => {
                      toast.info(`SMS Update sent to ${selectedReport.contactNumber}`, {
                        description: "Status notification delivered via Semaphore relay.",
                      });
                    }}
                    className="h-10 px-4 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Notify Merchant</span>
                  </button>
                </div>
              </motion.aside>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          SIDE MODAL 2: FILE NEW REPORT / TICKET (SLIDES FROM RIGHT)
         ======================================================== */}
      <AnimatePresence>
        {newReportModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setNewReportModalOpen(false)}
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
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1A1A]">File Incident Report</h3>
                      <p className="text-xs text-[#757575]">Manual escalation or support desk dispatch</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewReportModalOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#757575] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleCreateReport} className="flex-1 flex flex-col justify-between overflow-y-auto">
                  <div className="p-6 space-y-4 text-xs">
                    <div>
                      <label className="font-semibold text-[#1A1A1A] block mb-1">Reporter Name *</label>
                      <input
                        type="text"
                        required
                        value={newReporterName}
                        onChange={(e) => setNewReporterName(e.target.value)}
                        placeholder="e.g. Maria Santos"
                        className="w-full h-11 px-4 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none focus:border-[#D63C1E] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#1A1A1A] block mb-1">Store Name *</label>
                        <input
                          type="text"
                          required
                          value={newStoreName}
                          onChange={(e) => setNewStoreName(e.target.value)}
                          placeholder="e.g. Aling Nena Sari-Sari"
                          className="w-full h-11 px-4 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none focus:border-[#D63C1E] transition-all"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-[#1A1A1A] block mb-1">Branch</label>
                        <input
                          type="text"
                          value={newBranch}
                          onChange={(e) => setNewBranch(e.target.value)}
                          placeholder="e.g. Makati Branch"
                          className="w-full h-11 px-4 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none focus:border-[#D63C1E] transition-all"
                        />
                      </div>
                    </div>

                    {/* Priority Selector Cards */}
                    <div>
                      <label className="font-semibold text-[#1A1A1A] block mb-1.5">Priority Level *</label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          {
                            val: "High" as TicketPriority,
                            title: "High",
                            desc: "Checkout Blocked",
                            active: "bg-red-50 text-red-700 border-red-300 ring-1 ring-red-400",
                          },
                          {
                            val: "Medium" as TicketPriority,
                            title: "Medium",
                            desc: "Degraded Feature",
                            active: "bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-400",
                          },
                          {
                            val: "Low" as TicketPriority,
                            title: "Low",
                            desc: "General Inquiry",
                            active: "bg-gray-100 text-gray-800 border-gray-300 ring-1 ring-gray-400",
                          },
                        ].map((p) => (
                          <button
                            type="button"
                            key={p.val}
                            onClick={() => setNewPriority(p.val)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              newPriority === p.val
                                ? p.active
                                : "bg-[#F9F9F9] border-[#EAEAEA] hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-xs">{p.title}</span>
                              {newPriority === p.val && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <p className="text-[10px] text-[#757575] leading-tight">{p.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Issue Category */}
                    <div>
                      <label className="font-semibold text-[#1A1A1A] block mb-1">Issue Category *</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as TicketCategory)}
                        className="w-full h-11 px-3 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none cursor-pointer font-medium"
                      >
                        <option value="POS Sync & Offline Queue">POS Sync & Offline Queue</option>
                        <option value="Hardware & Printer">Hardware & Printer</option>
                        <option value="Payment & QRPh Mismatch">Payment & QRPh Mismatch</option>
                        <option value="Account & Session Lock">Account & Session Lock</option>
                        <option value="BIR & Tax Compliance">BIR & Tax Compliance</option>
                        <option value="Inventory Stock Delta">Inventory Stock Delta</option>
                      </select>
                    </div>

                    {/* Assigned to: (Position) Dropdown Card Selector */}
                    <div>
                      <label className="font-semibold text-[#1A1A1A] block mb-1">
                        Assigned to: (Position) *
                      </label>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="w-full h-12 px-4 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] hover:bg-white text-xs font-semibold text-[#1A1A1A] flex items-center justify-between cursor-pointer transition-all">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#D63C1E]/10 text-[#D63C1E] font-bold text-[10px] flex items-center justify-center">
                              {getPositionInitials(newAssignedPosition)}
                            </div>
                            <span className="truncate">{newAssignedPosition}</span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-[#757575]" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-[420px] max-w-[calc(100vw-3rem)] rounded-2xl p-2 bg-white shadow-xl border border-[#EAEAEA] z-50 space-y-1.5 max-h-[280px] overflow-y-auto"
                        >
                          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                            Select Target Support Position
                          </div>
                          {POSITION_DETAILS.map((pos) => (
                            <DropdownMenuItem
                              key={pos.name}
                              onClick={() => setNewAssignedPosition(pos.name)}
                              className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 border ${
                                newAssignedPosition === pos.name
                                  ? "bg-[#D63C1E]/5 border-[#D63C1E]/30"
                                  : "hover:bg-[#F5F5F5] border-transparent"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 border ${pos.colorClass}`}
                              >
                                {pos.initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-[#1A1A1A] truncate">{pos.name}</span>
                                  {newAssignedPosition === pos.name && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D63C1E] shrink-0 ml-1.5" />
                                  )}
                                </div>
                                <div className="text-[10px] font-semibold text-[#D63C1E]">{pos.department}</div>
                                <p className="text-[11px] text-[#757575] leading-snug mt-0.5">{pos.description}</p>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div>
                      <label className="font-semibold text-[#1A1A1A] block mb-1">Subject / Summary *</label>
                      <input
                        type="text"
                        required
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Brief summary of the issue..."
                        className="w-full h-11 px-4 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none focus:border-[#D63C1E] transition-all"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-[#1A1A1A] block mb-1">Detailed Description</label>
                      <textarea
                        rows={4}
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Describe what occurred, steps to reproduce, or cashier observations..."
                        className="w-full p-4 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none focus:border-[#D63C1E] transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="p-5 border-t border-[#EAEAEA] bg-white flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setNewReportModalOpen(false)}
                      className="h-11 px-5 rounded-full border border-[#EAEAEA] text-[#757575] hover:text-[#1A1A1A] font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-11 px-6 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white font-semibold text-xs transition-all cursor-pointer shadow-xs"
                    >
                      Create Ticket
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
