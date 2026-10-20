"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  Mail,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  X,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  Clock,
  AlertTriangle,
  Check,
  Lock,
  Trash2,
  RotateCcw,
  Edit3,
  TrendingUp,
  Shield,
  Send,
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
// TYPES & DATA STRUCTURES
// ====================================================================

export type RoleType =
  | "Super Admin"
  | "Branch Manager"
  | "Financial Analyst"
  | "Store Supervisor"
  | "Inventory Clerk"
  | "Support Agent";

export type UserStatus = "Active" | "Suspended" | "Pending" | "Expired" | "Accepted";

export type BranchHub =
  | "Makati Central Hub"
  | "Central BGC Flagship"
  | "Cebu Tech Regional"
  | "Davao Operations Hub"
  | "Corporate HQ Pasig"
  | "Pasig Depot"
  | "Resolution Hub";

export interface UserAccount {
  id: string; // USR-10XX
  name: string;
  avatarInitials: string;
  email: string;
  phone: string;
  role: RoleType;
  branch?: BranchHub;
  status: UserStatus;
  lastActive: string;
  invitedAt?: string;
  expiresAt?: string;
}

export interface RoleDefinition {
  title: RoleType;
  description: string;
  badgeClass: string;
  avatarBg: string;
  entitlements: string[];
}

export const ROLE_DEFINITIONS: Record<RoleType, RoleDefinition> = {
  "Super Admin": {
    title: "Super Admin",
    description: "Unrestricted access across all retail branches and settings",
    badgeClass: "bg-[#D63C1E]/10 text-[#D63C1E] border-[#D63C1E]/30",
    avatarBg: "bg-[#D63C1E]/10 text-[#D63C1E]",
    entitlements: ["POS Access", "Realtime Stock Sync", "Settlement View", "Admin Audit Log"],
  },
  "Branch Manager": {
    title: "Branch Manager",
    description: "Branch financials, team attendance, and operator management",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    avatarBg: "bg-blue-50 text-blue-700",
    entitlements: ["POS Access", "Realtime Stock Sync", "Daily Settlements"],
  },
  "Financial Analyst": {
    title: "Financial Analyst",
    description: "Read & export access for revenue reports and settlements",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    avatarBg: "bg-emerald-50 text-emerald-700",
    entitlements: ["Revenue Analytics", "Z-Reading Export", "Settlement View"],
  },
  "Store Supervisor": {
    title: "Store Supervisor",
    description: "Shift closures, void permissions, and daily counter oversight",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    avatarBg: "bg-amber-50 text-amber-700",
    entitlements: ["POS Terminal", "Void & Refund", "Shift Cash Count"],
  },
  "Inventory Clerk": {
    title: "Inventory Clerk",
    description: "Stock arrivals, warehouse transfers, and damaged goods logging",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    avatarBg: "bg-purple-50 text-purple-700",
    entitlements: ["Inventory Ledger", "Supplier PO Receipts", "Stock Count"],
  },
  "Support Agent": {
    title: "Support Agent",
    description: "Incident triage, merchant trouble tickets, and diagnostic traceroute",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
    avatarBg: "bg-cyan-50 text-cyan-700",
    entitlements: ["Helpdesk View", "POS Traceroute", "Merchant Phone Telephony"],
  },
};

// Initial Active Users
const INITIAL_ACTIVE_USERS: UserAccount[] = [
  {
    id: "USR-101",
    name: "Elena Cruz",
    avatarInitials: "EC",
    email: "elena.cruz@myshop.ph",
    phone: "+63 917 551 2890",
    role: "Super Admin",
    branch: "Makati Central Hub",
    status: "Active",
    lastActive: "Just now",
  },
  {
    id: "USR-102",
    name: "Marcus Thorne",
    avatarInitials: "MT",
    email: "m.thorne@myshop.ph",
    phone: "+63 928 334 1982",
    role: "Branch Manager",
    branch: "Central BGC Flagship",
    status: "Active",
    lastActive: "14 mins ago",
  },
  {
    id: "USR-103",
    name: "Sophia Lin",
    avatarInitials: "SL",
    email: "sophia.lin@myshop.ph",
    phone: "+63 918 227 4910",
    role: "Branch Manager",
    branch: "Cebu Tech Regional",
    status: "Active",
    lastActive: "1 hour ago",
  },
  {
    id: "USR-104",
    name: "Beatrice Wong",
    avatarInitials: "BW",
    email: "beatrice.w@myshop.ph",
    phone: "+63 939 441 0021",
    role: "Financial Analyst",
    branch: "Corporate HQ Pasig",
    status: "Active",
    lastActive: "3 hours ago",
  },
  {
    id: "USR-105",
    name: "David Tan",
    avatarInitials: "DT",
    email: "david.tan@myshop.ph",
    phone: "+63 922 990 7731",
    role: "Store Supervisor",
    branch: "Davao Operations Hub",
    status: "Active",
    lastActive: "Yesterday",
  },
  {
    id: "USR-106",
    name: "Arthur Pendelton",
    avatarInitials: "AP",
    email: "arthur.p@myshop.ph",
    phone: "+63 927 661 5504",
    role: "Inventory Clerk",
    branch: "Pasig Depot",
    status: "Active",
    lastActive: "2 days ago",
  },
  {
    id: "USR-107",
    name: "Carmela Santos",
    avatarInitials: "CS",
    email: "carmela.s@myshop.ph",
    phone: "+63 919 883 2219",
    role: "Support Agent",
    branch: "Resolution Hub",
    status: "Active",
    lastActive: "5 mins ago",
  },
];

// Initial Pending Invites
const INITIAL_PENDING_INVITES: UserAccount[] = [
  {
    id: "INV-201",
    name: "Jerome Reyes",
    avatarInitials: "JR",
    email: "jerome.reyes@myshop.ph",
    phone: "+63 917 882 1044",
    role: "Store Supervisor",
    branch: "Makati Central Hub",
    status: "Expired",
    lastActive: "Invited 8 days ago",
    invitedAt: "Oct 10, 2024",
    expiresAt: "Oct 17, 2024",
  },
  {
    id: "INV-202",
    name: "Natasha Chen",
    avatarInitials: "NC",
    email: "natasha.chen@myshop.ph",
    phone: "+63 928 554 9920",
    role: "Branch Manager",
    branch: "Central BGC Flagship",
    status: "Pending",
    lastActive: "Invited 2 days ago",
    invitedAt: "Oct 17, 2024",
    expiresAt: "Oct 24, 2024",
  },
  {
    id: "INV-203",
    name: "Gabriel Aquino",
    avatarInitials: "GA",
    email: "gabriel.a@myshop.ph",
    phone: "+63 908 119 4432",
    role: "Support Agent",
    branch: "Resolution Hub",
    status: "Accepted",
    lastActive: "Awaiting final onboarding",
    invitedAt: "Oct 18, 2024",
    expiresAt: "Oct 25, 2024",
  },
];

// Dropdown Card: Role Filters
export const ROLE_FILTER_OPTIONS = [
  {
    value: "all",
    label: "All Roles",
    desc: "Display operators across all administrative & store tiers",
    badge: "1,248 Users",
  },
  {
    value: "Super Admin",
    label: "Super Admin",
    desc: "Full root access across all retail branches and settings",
    badge: "8 Users",
  },
  {
    value: "Branch Manager",
    label: "Branch Manager",
    desc: "Branch financials, team attendance, and store operations",
    badge: "48 Users",
  },
  {
    value: "Financial Analyst",
    label: "Financial Analyst",
    desc: "Revenue audit, settlement reconciliation & tax exports",
    badge: "14 Users",
  },
  {
    value: "Store Supervisor",
    label: "Store Supervisor",
    desc: "Cash count, void authorizations, and terminal oversight",
    badge: "186 Users",
  },
  {
    value: "Inventory Clerk",
    label: "Inventory Clerk",
    desc: "Stock inward sync, PO reception & damaged write-offs",
    badge: "320 Users",
  },
  {
    value: "Support Agent",
    label: "Support Agent",
    desc: "Merchant technical triage and POS diagnostics",
    badge: "672 Users",
  },
];

export default function UserManagementPage() {
  // Mobile sidebar navigation
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active Tab: "active" | "pending"
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Data
  const [activeUsers, setActiveUsers] = useState<UserAccount[]>(INITIAL_ACTIVE_USERS);
  const [pendingInvites, setPendingInvites] = useState<UserAccount[]>(INITIAL_PENDING_INVITES);

  // Side Modal State (STRICT RULE: Right Edge slide-out only)
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Form State: Invite New Team Member
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRole, setInviteRole] = useState<RoleType>("Store Supervisor");

  // Form State: Edit User Role Drawer
  const [editRole, setEditRole] = useState<RoleType>("Store Supervisor");

  // Lock body scroll when any side modal is open
  useEffect(() => {
    const isModalOpen = selectedUser !== null || inviteModalOpen;
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedUser, inviteModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedUser(null);
        setInviteModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update edit drawer state whenever a user is selected
  useEffect(() => {
    if (selectedUser) {
      setEditRole(selectedUser.role);
    }
  }, [selectedUser]);

  // Current working list based on tab
  const currentList = activeTab === "active" ? activeUsers : pendingInvites;

  // Filtered list
  const filteredUsers = useMemo(() => {
    return currentList.filter((user) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [currentList, searchQuery, roleFilter]);

  // Paginated list
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  // Handle Invite Submit
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error("Missing Information", {
        description: "Please specify the full name and company email.",
      });
      return;
    }

    const initials = inviteName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const newInvite: UserAccount = {
      id: `INV-${Math.floor(200 + Math.random() * 800)}`,
      name: inviteName.trim(),
      avatarInitials: initials || "OP",
      email: inviteEmail.trim(),
      phone: invitePhone.trim() || "+63 900 000 0000",
      role: inviteRole,
      status: "Pending",
      lastActive: "Invited just now",
      invitedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      expiresAt: "In 7 days",
    };

    setPendingInvites([newInvite, ...pendingInvites]);
    setInviteModalOpen(false);

    // Reset Form
    setInviteName("");
    setInviteEmail("");
    setInvitePhone("");
    setInviteRole("Store Supervisor");

    toast.success("Invitation Sent", {
      description: `Access credentials dispatched to ${newInvite.email} for ${newInvite.role}.`,
    });
  };

  // Handle Save User Permissions
  const handleSavePermissions = () => {
    if (!selectedUser) return;
    const updated: UserAccount = {
      ...selectedUser,
      role: editRole,
    };

    if (activeTab === "active") {
      setActiveUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
    } else {
      setPendingInvites((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
    }

    setSelectedUser(updated);
    toast.success("Permissions Updated", {
      description: `${updated.name}'s role assigned to ${updated.role}.`,
    });
  };

  // Handle Suspend/Reactivate User
  const handleToggleSuspend = () => {
    if (!selectedUser) return;
    const isSuspended = selectedUser.status === "Suspended";
    const newStatus: UserStatus = isSuspended ? "Active" : "Suspended";
    const updated: UserAccount = { ...selectedUser, status: newStatus };

    if (activeTab === "active") {
      setActiveUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
    } else {
      setPendingInvites((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
    }

    setSelectedUser(updated);
    toast.warning(isSuspended ? "Account Reactivated" : "Operator Account Suspended", {
      description: isSuspended
        ? `${updated.name} can now access POS terminals.`
        : `${updated.name}'s active sessions terminated across all devices.`,
    });
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
          title="User Management"
          onOpenMobile={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 pt-20 px-4 sm:px-6 md:px-8 pb-12 max-w-[1600px] w-full mx-auto">
          {/* Header & Quick Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D63C1E] block">
                Access &amp; Governance
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A] mt-0.5">
                User Management
              </h1>
              <p className="text-xs sm:text-sm text-[#757575] mt-1">
                Manage administrative operators, role credentials, and access permissions.
              </p>
            </div>

            {/* Invite User CTA */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className="h-11 px-5 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite User</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              SUMMARY KPI SECTION (Floating Canvas)
             ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* KPI Card 1: Directory Volume */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#757575] block">
                    Directory Volume
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
                      1,248
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                      <TrendingUp className="w-3 h-3" />
                      +32 this month
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#D63C1E]/10 flex items-center justify-center text-[#D63C1E] group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-[#757575] mt-4">
                Active store supervisors, administrators, and authorized portal operators.
              </p>
            </div>

            {/* KPI Card 2: Awaiting Acceptance */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#757575] block">
                    Awaiting Acceptance
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
                      24
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">
                      <Clock className="w-3 h-3" />
                      Pending Activation
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-[#757575] mt-4">
                Invitations sent via email awaiting team security verification and PIN setup.
              </p>
            </div>
          </div>

          {/* ========================================================
              MAIN FLOATING TABLE CARD CONTAINER
             ======================================================== */}
          <div className="bg-white rounded-3xl border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Table Header Controls / Tab Switcher Bar */}
            <div className="p-5 border-b border-[#F5F5F5] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Segmented Pill Control */}
              <div className="inline-flex p-1 bg-[#F5F5F5] rounded-full self-start">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("active");
                    setCurrentPage(1);
                  }}
                  className={`h-9 px-4 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "active"
                      ? "bg-white text-[#1A1A1A] shadow-xs"
                      : "text-[#757575] hover:text-[#1A1A1A]"
                  }`}
                >
                  <span>Active Users</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#EEEEEE] text-[#565F6D] text-[10px] font-bold">
                    1,248
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("pending");
                    setCurrentPage(1);
                  }}
                  className={`h-9 px-4 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "pending"
                      ? "bg-white text-[#1A1A1A] shadow-xs"
                      : "text-[#757575] hover:text-[#1A1A1A]"
                  }`}
                >
                  <span>Pending Invites</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#D63C1E]/10 text-[#D63C1E] text-[10px] font-bold">
                    24
                  </span>
                </button>
              </div>

              {/* Search & Role Filter Toolbar */}
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
                    placeholder="Search name, email, role..."
                    className="w-full h-10 pl-9 pr-4 rounded-full bg-[#F9F9F9] border border-[#EAEAEA] text-xs text-[#1A1A1A] placeholder:text-[#A0A0A0] focus:bg-white focus:outline-none focus:border-[#D63C1E] shadow-xs transition-all"
                  />
                </div>

                {/* Role Filter Dropdown Cards */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-10 px-4 rounded-full bg-white border border-[#EAEAEA] text-xs font-medium text-[#1A1A1A] flex items-center gap-2 shadow-xs hover:bg-[#F9F9F9] cursor-pointer transition-all">
                    <Filter className="w-3.5 h-3.5 text-[#757575]" />
                    <span>
                      Role: <strong className="text-[#1A1A1A]">{roleFilter === "all" ? "All Roles" : roleFilter}</strong>
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#757575]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-80 rounded-2xl p-2 bg-white shadow-xl border border-[#EAEAEA] z-50 space-y-1"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                      Filter By Assigned Role
                    </div>
                    {ROLE_FILTER_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => {
                          setRoleFilter(opt.value);
                          setCurrentPage(1);
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                          roleFilter === opt.value
                            ? "bg-[#D63C1E]/5 border border-[#D63C1E]/20"
                            : "hover:bg-[#F5F5F5] border border-transparent"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#1A1A1A]">{opt.label}</span>
                            {roleFilter === opt.value && (
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

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F0F0F0] text-[#757575] text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6">User Name</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4">Assigned Role</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F7F7]">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedUser(item)}
                        className="hover:bg-[#F9F9F9] transition-colors group cursor-pointer"
                      >
                        {/* Clean User Name with Initials Avatar */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                                ROLE_DEFINITIONS[item.role]?.avatarBg || "bg-[#F3F3F3] text-[#565F6D]"
                              }`}
                            >
                              {item.avatarInitials}
                            </div>
                            <span className="font-bold text-xs text-[#1A1A1A] group-hover:text-[#D63C1E] transition-colors">
                              {item.name}
                            </span>
                          </div>
                        </td>

                        {/* Email Address */}
                        <td className="py-4 px-4 text-xs font-medium text-[#565F6D] whitespace-nowrap">
                          {item.email}
                        </td>

                        {/* Assigned Role Pill */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${
                              ROLE_DEFINITIONS[item.role]?.badgeClass || "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {item.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              item.status === "Active" || item.status === "Accepted"
                                ? "bg-emerald-50 text-emerald-700"
                                : item.status === "Pending"
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
                              setSelectedUser(item);
                            }}
                            className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] transition-all cursor-pointer"
                            title="Manage User Permissions"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-[#757575]">
                        No users or team members match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="py-4 px-6 border-t border-[#F5F5F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#757575]">
              <div>
                Showing <span className="font-semibold text-[#1A1A1A]">{paginatedUsers.length}</span> of{" "}
                <span className="font-semibold text-[#1A1A1A]">{filteredUsers.length}</span> members
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
          SIDE MODAL 1: EDIT USER ROLE & PERMISSIONS (RIGHT ONLY)
         ======================================================== */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedUser(null)}
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
                    <div
                      className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center ${
                        ROLE_DEFINITIONS[selectedUser.role]?.avatarBg || "bg-[#F3F3F3] text-[#565F6D]"
                      }`}
                    >
                      {selectedUser.avatarInitials}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1A1A]">{selectedUser.name}</h3>
                      <p className="text-xs text-[#757575]">Account role &amp; access permissions</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#757575] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                  {/* Status Banner */}
                  <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#757575] block">Account Status</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                          selectedUser.status === "Active" || selectedUser.status === "Accepted"
                            ? "bg-emerald-50 text-emerald-700"
                            : selectedUser.status === "Pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {selectedUser.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#757575] block">Activity</span>
                      <span className="font-semibold text-[#1A1A1A] block mt-1">{selectedUser.lastActive}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#757575] block">Account ID</span>
                      <span className="font-bold text-[#D63C1E] block mt-1">{selectedUser.id}</span>
                    </div>
                  </div>

                  {/* Merchant / Operator Profile (Strictly Name & Contact Info) */}
                  <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] space-y-2.5">
                    <div className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider text-[#757575]">
                      Merchant Subscriber Profile
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                      <span className="text-[#757575]">Full Name:</span>
                      <span className="font-bold text-[#1A1A1A]">{selectedUser.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                      <span className="text-[#757575]">Contact Phone:</span>
                      <span className="font-semibold text-[#1A1A1A]">{selectedUser.phone}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#757575]">Contact Email:</span>
                      <span className="font-semibold text-[#1A1A1A]">{selectedUser.email}</span>
                    </div>
                  </div>

                  {/* Role Assignment Selector: Dropdown Button */}
                  <div className="space-y-2">
                    <label className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider text-[#757575] block">
                      Assign Permission Role
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full h-12 px-4 rounded-xl border border-[#EAEAEA] bg-white hover:bg-[#F9F9F9] focus:outline-none focus:border-[#D63C1E] transition-all flex items-center justify-between text-xs text-[#1A1A1A] cursor-pointer shadow-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                              ROLE_DEFINITIONS[editRole]?.badgeClass || "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {editRole}
                          </span>
                          <span className="text-xs text-[#757575] truncate">
                            {ROLE_DEFINITIONS[editRole]?.description}
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-[#757575] shrink-0 ml-2" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-[calc(100vw-5rem)] max-w-md rounded-2xl p-2 bg-white shadow-2xl border border-[#EAEAEA] z-[70] space-y-1.5"
                      >
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                          Select Permission Role
                        </div>
                        {(
                          [
                            "Super Admin",
                            "Branch Manager",
                            "Financial Analyst",
                            "Store Supervisor",
                            "Inventory Clerk",
                            "Support Agent",
                          ] as RoleType[]
                        ).map((role) => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => setEditRole(role)}
                            className={`p-3 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 border ${
                              editRole === role
                                ? "bg-[#D63C1E]/5 border-[#D63C1E]/30"
                                : "hover:bg-[#F5F5F5] border-transparent"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-[#1A1A1A]">{role}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                    ROLE_DEFINITIONS[role]?.badgeClass
                                  }`}
                                >
                                  {role}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#757575] leading-snug mt-1">
                                {ROLE_DEFINITIONS[role]?.description}
                              </p>
                            </div>
                            {editRole === role && (
                              <CheckCircle2 className="w-4 h-4 text-[#D63C1E] shrink-0 mt-0.5" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Revocation Zone (Clean border, NO gray background, text-black) */}
                  <div className="p-4 rounded-2xl border border-red-200 bg-white space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-bold text-xs text-red-600">Access Suspension &amp; Revocation</span>
                    </div>
                    <p className="text-black font-medium text-xs leading-relaxed">
                      Temporarily terminate this operator's active POS sessions across all devices or revoke security credentials.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleToggleSuspend}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          selectedUser.status === "Suspended"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {selectedUser.status === "Suspended" ? "Reactivate Operator Account" : "Suspend Operator Access"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Cancel and Save */}
                <div className="p-5 border-t border-[#EAEAEA] bg-white flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="h-11 px-5 rounded-full border border-[#EAEAEA] text-[#757575] hover:text-[#1A1A1A] font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    className="h-11 px-6 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white font-semibold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </motion.aside>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          SIDE MODAL 2: INVITE NEW USER (RIGHT EDGE SLIDE-OUT)
         ======================================================== */}
      <AnimatePresence>
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setInviteModalOpen(false)}
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
                    <div className="w-10 h-10 rounded-full bg-[#D63C1E]/10 flex items-center justify-center text-[#D63C1E]">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1A1A]">Invite Team Member</h3>
                      <p className="text-xs text-[#757575]">Grant administrative role and system access credentials</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#757575] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleInviteSubmit} className="flex-1 flex flex-col justify-between overflow-y-auto">
                  <div className="p-6 space-y-4 text-xs">
                    {/* Full Name */}
                    <div>
                      <label className="font-semibold text-[#1A1A1A] block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="e.g. Gabriel Ramos"
                        className="w-full h-11 px-4 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none focus:border-[#D63C1E] transition-all font-medium text-xs text-[#1A1A1A]"
                      />
                    </div>

                    {/* Company Email */}
                    <div>
                      <label className="font-semibold text-[#1A1A1A] block mb-1">Company Email Address *</label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="name@myshop.ph"
                        className="w-full h-11 px-4 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none focus:border-[#D63C1E] transition-all font-medium text-xs text-[#1A1A1A]"
                      />
                    </div>

                    {/* Contact Phone */}
                    <div>
                      <label className="font-semibold text-[#1A1A1A] block mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value)}
                        placeholder="+63 917 000 0000"
                        className="w-full h-11 px-4 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none focus:border-[#D63C1E] transition-all font-medium text-xs text-[#1A1A1A]"
                      />
                    </div>

                    {/* Permission Role */}
                    <div>
                      <label className="font-semibold text-[#1A1A1A] block mb-1">Permission Role *</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as RoleType)}
                        className="w-full h-11 px-4 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] focus:bg-white focus:outline-none focus:border-[#D63C1E] cursor-pointer font-medium text-xs text-[#1A1A1A]"
                      >
                        <option value="Store Supervisor">Store Supervisor</option>
                        <option value="Branch Manager">Branch Manager</option>
                        <option value="Financial Analyst">Financial Analyst</option>
                        <option value="Support Agent">Support Agent</option>
                        <option value="Inventory Clerk">Inventory Clerk</option>
                        <option value="Super Admin">Super Admin</option>
                      </select>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-5 border-t border-[#EAEAEA] bg-white flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setInviteModalOpen(false)}
                      className="h-11 px-5 rounded-full border border-[#EAEAEA] text-[#757575] hover:text-[#1A1A1A] font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-11 px-6 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white font-semibold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Invitation</span>
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
