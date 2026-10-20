"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Terminal,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Server,
  Cpu,
  Clock,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  RotateCcw,
  Sparkles,
  ExternalLink,
  X,
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  Database,
  Send,
  Trash2,
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

export type ServiceStatus = "operational" | "degraded" | "down";

export interface SystemService {
  id: string;
  name: string;
  subsystem: string;
  category: "Core API" | "Database" | "Third-Party" | "Sync & Workers" | "Storage & CDN";
  endpoint: string;
  region: string;
  status: ServiceStatus;
  latencyMs: number;
  uptime30d: number;
  errorRate: number;
  cpuLoad: number;
  memoryLoad: number;
  lastCheck: string;
  description: string;
  incidents: {
    id: string;
    timestamp: string;
    title: string;
    severity: "critical" | "warning" | "info";
    resolved: boolean;
    notes: string;
  }[];
}

export type IncidentStatus = "Identified" | "Pending" | "Resolved" | "Investigation";

export const INCIDENT_STATUS_SPECS: Record<
  IncidentStatus,
  { label: string; badgeClass: string; dotClass: string; desc: string }
> = {
  Identified: {
    label: "Identified",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
    desc: "Root cause pinpointed by engineering; fix being drafted.",
  },
  Pending: {
    label: "Pending",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
    desc: "Awaiting upstream vendor patch or deployment validation.",
  },
  Resolved: {
    label: "Resolved",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
    desc: "Service fully restored to operational SLA thresholds.",
  },
  Investigation: {
    label: "Investigation",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    dotClass: "bg-red-500 animate-pulse",
    desc: "Actively troubleshooting triage and log tracing.",
  },
};

export interface IncidentLogEntry {
  id: string;
  serviceName: string;
  title: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  duration: string;
  status: IncidentStatus;
  impact: string;
  rootCause: string;
}

// Initial Mock Services (32 nodes represented)
const INITIAL_SERVICES: SystemService[] = [
  {
    id: "SRV-POS-01",
    name: "POS Transaction Gateway",
    subsystem: "Sales & Cashier Engine",
    category: "Core API",
    endpoint: "https://api.myshop.ph/v1/pos/gateway",
    region: "ap-southeast-1 (Singapore)",
    status: "operational",
    latencyMs: 24,
    uptime30d: 99.99,
    errorRate: 0.01,
    cpuLoad: 28,
    memoryLoad: 46,
    lastCheck: "Just now",
    description: "High-throughput edge proxy for offline/online checkout transactions from merchant mobile terminals.",
    incidents: [
      {
        id: "INC-881",
        timestamp: "Today, 04:12 AM",
        title: "Automated failover drill passed",
        severity: "info",
        resolved: true,
        notes: "Zero packet loss recorded during primary switch.",
      },
    ],
  },
  {
    id: "SRV-AUTH-02",
    name: "Auth & Single Sign-On (SSO)",
    subsystem: "Security & IAM",
    category: "Core API",
    endpoint: "https://auth.myshop.ph/oauth2/v1",
    region: "ap-southeast-1 (Singapore)",
    status: "operational",
    latencyMs: 18,
    uptime30d: 100.0,
    errorRate: 0.0,
    cpuLoad: 19,
    memoryLoad: 38,
    lastCheck: "Just now",
    description: "JWT token issuer, Supabase Auth gateway, and merchant PIN code authentication service.",
    incidents: [],
  },
  {
    id: "SRV-DB-03",
    name: "Database Cluster (Primary SQL)",
    subsystem: "PostgreSQL High Availability",
    category: "Database",
    endpoint: "postgres://db.myshop.supabase.co:5432",
    region: "ap-southeast-1 (Singapore)",
    status: "operational",
    latencyMs: 14,
    uptime30d: 99.98,
    errorRate: 0.02,
    cpuLoad: 42,
    memoryLoad: 68,
    lastCheck: "1m ago",
    description: "Multi-tenant PostgreSQL cluster running connection pooling with pgBouncer for 10,000+ store branches.",
    incidents: [],
  },
  {
    id: "SRV-SMS-04",
    name: "SMS & Push Notification Relay",
    subsystem: "Semaphore Telephony Integration",
    category: "Third-Party",
    endpoint: "https://api.semaphore.co/api/v4/messages",
    region: "ph-manila (Local Edge)",
    status: "down",
    latencyMs: 0,
    uptime30d: 96.4,
    errorRate: 18.4,
    cpuLoad: 12,
    memoryLoad: 22,
    lastCheck: "Just now",
    description: "Outbound SMS OTPs and end-of-day sales summary dispatches to merchant mobile numbers.",
    incidents: [
      {
        id: "INC-904",
        timestamp: "Today, 11:45 AM",
        title: "Semaphore Telco Gateway Timeout (504)",
        severity: "critical",
        resolved: false,
        notes: "Upstream telco provider degraded in NCR. Automatic fallback to secondary Twilio route queued.",
      },
    ],
  },
  {
    id: "SRV-PAY-05",
    name: "Payment Webhook Dispatcher",
    subsystem: "PayMongo & QRPh Listener",
    category: "Third-Party",
    endpoint: "https://api.myshop.ph/webhooks/paymongo",
    region: "ap-southeast-1 (Singapore)",
    status: "operational",
    latencyMs: 38,
    uptime30d: 99.95,
    errorRate: 0.04,
    cpuLoad: 31,
    memoryLoad: 40,
    lastCheck: "Just now",
    description: "Ingests PayMongo GCash, Maya, and tokenized card subscription renewal webhooks in real-time.",
    incidents: [],
  },
  {
    id: "SRV-INV-06",
    name: "Inventory Sync Engine",
    subsystem: "Stock Delta Reconciliation",
    category: "Sync & Workers",
    endpoint: "wss://sync.myshop.ph/inventory/deltas",
    region: "ap-southeast-1 (Singapore)",
    status: "degraded",
    latencyMs: 640,
    uptime30d: 98.8,
    errorRate: 2.1,
    cpuLoad: 78,
    memoryLoad: 82,
    lastCheck: "30s ago",
    description: "Broadcasts multi-branch inventory stock updates to connected cash registers. Experiencing queue lag during peak hours.",
    incidents: [
      {
        id: "INC-899",
        timestamp: "Today, 01:20 PM",
        title: "Sync consumer lag elevated to 4,200 msgs",
        severity: "warning",
        resolved: false,
        notes: "Autoscaling worker node 4 in progress to drain Redis queue backlog.",
      },
    ],
  },
  {
    id: "SRV-REP-07",
    name: "Reporting & BI Pipeline",
    subsystem: "Analytical Aggregator",
    category: "Core API",
    endpoint: "https://analytics.myshop.ph/v2/metrics",
    region: "ap-southeast-1 (Singapore)",
    status: "operational",
    latencyMs: 48,
    uptime30d: 99.92,
    errorRate: 0.03,
    cpuLoad: 36,
    memoryLoad: 54,
    lastCheck: "2m ago",
    description: "Hourly aggregation pipeline computing platform GMV, provincial distribution, and merchant subscription MRR.",
    incidents: [],
  },
  {
    id: "SRV-CDN-08",
    name: "Cloud Storage & Invoicing CDN",
    subsystem: "AWS S3 & Cloudflare Edge",
    category: "Storage & CDN",
    endpoint: "https://cdn.myshop.ph/invoices",
    region: "ph-manila (Local Edge)",
    status: "operational",
    latencyMs: 15,
    uptime30d: 99.99,
    errorRate: 0.0,
    cpuLoad: 14,
    memoryLoad: 29,
    lastCheck: "Just now",
    description: "Serves encrypted PDF receipt downloads and merchant logo assets with sub-20ms edge caching.",
    incidents: [],
  },
  {
    id: "SRV-UTG-09",
    name: "Utang & Credit Risk Worker",
    subsystem: "Ledger Overdue Monitor",
    category: "Sync & Workers",
    endpoint: "https://worker.myshop.ph/utang/reconcile",
    region: "ap-southeast-1 (Singapore)",
    status: "operational",
    latencyMs: 52,
    uptime30d: 99.97,
    errorRate: 0.05,
    cpuLoad: 24,
    memoryLoad: 41,
    lastCheck: "4m ago",
    description: "Automated cron calculating customer overdue Utang interest schedules and credit limits.",
    incidents: [],
  },
  {
    id: "SRV-DEV-10",
    name: "Device Session Gatekeeper",
    subsystem: "Single-Device Session Arbiter",
    category: "Core API",
    endpoint: "https://api.myshop.ph/v1/sessions/verify",
    region: "ap-southeast-1 (Singapore)",
    status: "operational",
    latencyMs: 19,
    uptime30d: 100.0,
    errorRate: 0.0,
    cpuLoad: 33,
    memoryLoad: 45,
    lastCheck: "Just now",
    description: "Enforces 1 active mobile POS device per merchant staff account (user_device_sessions table policy).",
    incidents: [],
  },
];

// Initial Incident Logs
const INITIAL_INCIDENTS: IncidentLogEntry[] = [
  {
    id: "INC-904",
    serviceName: "SMS & Push Notification Relay",
    title: "Semaphore Upstream Gateway HTTP 504 Gateway Timeout",
    severity: "critical",
    timestamp: "Today, 11:45 AM",
    duration: "1h 56m (Ongoing)",
    status: "Investigation",
    impact: "Delayed OTP delivery to Globe subscribers during store staff shift sign-in.",
    rootCause: "Subsea fiber latency degradation impacting local telco aggregator endpoint.",
  },
  {
    id: "INC-899",
    serviceName: "Inventory Sync Engine",
    title: "Redis Queue Delta Backlog (> 4,000 items)",
    severity: "warning",
    timestamp: "Today, 01:20 PM",
    duration: "21m (Mitigating)",
    status: "Identified",
    impact: "Stock deductions for fast-moving items delayed by up to 2 seconds.",
    rootCause: "Burst in lunch-hour POS sales across 850 concurrent sari-sari store terminals.",
  },
  {
    id: "INC-912",
    serviceName: "PayMongo Payment Webhooks",
    title: "Upstream Bank Settlement Reconciliation Delay",
    severity: "warning",
    timestamp: "Today, 02:45 PM",
    duration: "45m (Pending Fix)",
    status: "Pending",
    impact: "GCash and Maya payout confirmation webhooks experiencing minor queuing.",
    rootCause: "Awaiting third-party partner clearing batch sync response.",
  },
  {
    id: "INC-881",
    serviceName: "POS Transaction Gateway",
    title: "Automated Regional Failover Test Completed",
    severity: "info",
    timestamp: "Today, 04:12 AM",
    duration: "4m 12s",
    status: "Resolved",
    impact: "Zero merchant checkout disruption. Automated health checks validated.",
    rootCause: "Scheduled preventive maintenance drill.",
  },
];

export default function SystemHealthPage() {
  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Tabs: 'services' | 'incidents'
  const [activeTab, setActiveTab] = useState<"services" | "incidents">("services");

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [refreshing, setRefreshing] = useState(false);

  // Data lists
  const [services, setServices] = useState<SystemService[]>(INITIAL_SERVICES);
  const [incidents, setIncidents] = useState<IncidentLogEntry[]>(INITIAL_INCIDENTS);

  // Side Modal States (STRICT RULE: All tables must have side modal only)
  const [selectedService, setSelectedService] = useState<SystemService | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentLogEntry | null>(null);
  const [diagnosticsModalOpen, setDiagnosticsModalOpen] = useState(false);

  // Diagnostics runner animation state
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [diagnosticsStep, setDiagnosticsStep] = useState(0);

  // Lock body scroll when any side modal is open
  useEffect(() => {
    const isModalOpen =
      selectedService !== null || selectedIncident !== null || diagnosticsModalOpen;
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedService, selectedIncident, diagnosticsModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedService(null);
        setSelectedIncident(null);
        setDiagnosticsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update incident status handler
  const handleUpdateIncidentStatus = (newStatus: IncidentStatus) => {
    if (!selectedIncident) return;
    const updated: IncidentLogEntry = {
      ...selectedIncident,
      status: newStatus,
    };
    setIncidents((prev) =>
      prev.map((item) => (item.id === selectedIncident.id ? updated : item))
    );
    setSelectedIncident(updated);
    toast.success("Incident Status Updated", {
      description: `${updated.id} status changed to ${newStatus}.`,
    });
  };

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const matchesSearch =
        svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        svc.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        svc.subsystem.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || svc.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === "All" || svc.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [services, searchQuery, statusFilter, categoryFilter]);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Health Status Refreshed", {
        description: "All 32 microservices and endpoints pinged successfully.",
      });
    }, 700);
  };

  // Run full diagnostics
  const handleStartDiagnostics = () => {
    setDiagnosticsModalOpen(true);
    setRunningDiagnostics(true);
    setDiagnosticsStep(1);

    setTimeout(() => setDiagnosticsStep(2), 700);
    setTimeout(() => setDiagnosticsStep(3), 1400);
    setTimeout(() => setDiagnosticsStep(4), 2100);
    setTimeout(() => setDiagnosticsStep(5), 2800);
    setTimeout(() => {
      setRunningDiagnostics(false);
      setDiagnosticsStep(6);
      toast.success("Diagnostics Complete", {
        description: "Zero fatal core anomalies. SMS relay fallback route recommended.",
      });
    }, 3500);
  };

  // Simulate pinging single service
  const handlePingService = (service: SystemService) => {
    toast.loading(`Pinging ${service.name}...`, { id: `ping-${service.id}` });
    setTimeout(() => {
      const newLatency =
        service.status === "down" ? 0 : Math.floor(Math.random() * 20) + 15;
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, latencyMs: newLatency, lastCheck: "Just now" } : s))
      );
      if (selectedService?.id === service.id) {
        setSelectedService((prev) =>
          prev ? { ...prev, latencyMs: newLatency, lastCheck: "Just now" } : null
        );
      }
      toast.success(`${service.name} Ping Result: ${newLatency > 0 ? `${newLatency}ms` : "Failed (Timeout)"}`, {
        id: `ping-${service.id}`,
      });
    }, 600);
  };

  // Simulate rolling restart
  const handleRestartService = (service: SystemService) => {
    toast.loading(`Queuing rolling restart for ${service.name}...`, { id: `restart-${service.id}` });
    setTimeout(() => {
      toast.success(`${service.name} restarted`, {
        description: "Health probe returned 200 OK across all active worker instances.",
        id: `restart-${service.id}`,
      });
      if (service.status === "down") {
        setServices((prev) =>
          prev.map((s) =>
            s.id === service.id ? { ...s, status: "operational", latencyMs: 32 } : s
          )
        );
        if (selectedService?.id === service.id) {
          setSelectedService((prev) =>
            prev ? { ...prev, status: "operational", latencyMs: 32 } : null
          );
        }
      }
    }, 1200);
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
          title="System Health & Infrastructure"
          onOpenMobile={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 pt-20 px-4 sm:px-6 md:px-8 pb-12 max-w-[1600px] w-full mx-auto">
          {/* Header & Quick Action Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                Core Platform Pulse
              </h1>
              <p className="text-xs sm:text-sm text-[#757575] mt-1">
                Live infrastructure monitoring for database clusters, API services, and payment gateways.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRefresh}
                className="h-11 px-5 rounded-full bg-white hover:bg-[#F3F3F3] text-[#1A1A1A] text-xs font-semibold border border-[#EAEAEA] shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#757575] ${refreshing ? "animate-spin" : ""}`} />
                <span>Refresh Status</span>
              </button>

              <button
                type="button"
                onClick={handleStartDiagnostics}
                className="h-11 px-5 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Run Diagnostics</span>
              </button>
            </div>
          </div>

          {/* Metric Cards Grid (Neo-Fintech Canvas) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Metric 1: Active Services */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">
                  Active Services
                </span>
                <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1A1A1A]">31</span>
                <span className="text-xs text-[#757575]">/ 32 total</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F5F5F5]">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  99.98% Health Index
                </span>
                <span className="text-[11px] text-[#757575]">+2 auto-healed</span>
              </div>
            </div>

            {/* Metric 2: Active Incident */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">
                  Active Incidents
                </span>
                <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1A1A1A]">1</span>
                <span className="text-xs text-amber-600 font-medium">Degraded Relay</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F5F5F5]">
                <span className="text-[11px] font-medium text-[#757575]">SMS Semaphore 504</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("incidents")}
                  className="text-[11px] font-semibold text-[#D63C1E] hover:underline flex items-center gap-0.5"
                >
                  <span>View Log</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Metric 4: Cluster Latency p95 */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">
                  Cluster Latency (p95)
                </span>
                <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1A1A1A]">28ms</span>
                <span className="text-xs text-emerald-600 font-medium">Optimal</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F5F5F5]">
                <span className="text-[11px] text-[#757575]">ap-southeast-1</span>
                <span className="text-[11px] font-semibold text-emerald-600">0.01% Error Rate</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="inline-flex p-1 rounded-full bg-white border border-[#EAEAEA] shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("services");
                  setStatusFilter("All");
                }}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "services"
                    ? "bg-[#D63C1E] text-white shadow-xs"
                    : "text-[#757575] hover:text-[#1A1A1A]"
                }`}
              >
                Services &amp; Endpoints ({services.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("incidents");
                  setStatusFilter("All");
                }}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "incidents"
                    ? "bg-[#D63C1E] text-white shadow-xs"
                    : "text-[#757575] hover:text-[#1A1A1A]"
                }`}
              >
                Incident &amp; Audit Log ({incidents.length})
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search input */}
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === "services"
                      ? "Search service or endpoint..."
                      : "Search incident logs..."
                  }
                  className="w-full h-10 pl-9 pr-4 rounded-full bg-white border border-[#EAEAEA] text-xs text-[#1A1A1A] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#D63C1E] shadow-xs transition-all"
                />
              </div>

              {/* Status Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="h-10 px-4 rounded-full bg-white border border-[#EAEAEA] text-xs font-medium text-[#1A1A1A] flex items-center gap-2 shadow-xs hover:bg-[#F9F9F9] cursor-pointer">
                  <Filter className="w-3.5 h-3.5 text-[#757575]" />
                  <span>Status: {statusFilter}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-2xl border border-[#EAEAEA] p-1 shadow-md bg-white min-w-[150px]">
                  {["All", "Operational", "Degraded", "Down"].map((st) => (
                    <DropdownMenuItem
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className="rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-[#F5F5F5]"
                    >
                      {st}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Category Dropdown (Services tab only) */}
              {activeTab === "services" && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-10 px-4 rounded-full bg-white border border-[#EAEAEA] text-xs font-medium text-[#1A1A1A] flex items-center gap-2 shadow-xs hover:bg-[#F9F9F9] cursor-pointer">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#757575]" />
                    <span>Category: {categoryFilter}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-2xl border border-[#EAEAEA] p-1 shadow-md bg-white min-w-[160px]">
                    {["All", "Core API", "Database", "Third-Party", "Sync & Workers", "Storage & CDN"].map(
                      (cat) => (
                        <DropdownMenuItem
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className="rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-[#F5F5F5]"
                        >
                          {cat}
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* ========================================================
              TAB 1: SERVICES & NODES TABLE
             ======================================================== */}
          {activeTab === "services" && (
            <div className="bg-white rounded-3xl border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#F0F0F0] text-[#757575] text-[11px] uppercase tracking-wider font-semibold">
                      <th className="py-3.5 px-6">Service Component</th>
                      <th className="py-3.5 px-4">Subsystem</th>
                      <th className="py-3.5 px-4">Region</th>
                      <th className="py-3.5 px-4 text-center">Latency</th>
                      <th className="py-3.5 px-4 text-center">30d Uptime</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F7F7]">
                    {filteredServices.length > 0 ? (
                      filteredServices.map((svc) => (
                        <tr
                          key={svc.id}
                          onClick={() => setSelectedService(svc)}
                          className="hover:bg-[#F9F9F9] transition-colors group cursor-pointer"
                        >
                          {/* Clean Service Component column */}
                          <td className="py-4 px-6 text-xs font-bold text-[#1A1A1A] whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  svc.status === "operational"
                                    ? "bg-emerald-500"
                                    : svc.status === "degraded"
                                    ? "bg-amber-500 animate-ping"
                                    : "bg-red-500"
                                }`}
                              />
                              <span>{svc.name}</span>
                            </div>
                          </td>

                          {/* Subsystem category */}
                          <td className="py-4 px-4 text-xs text-[#565F6D] whitespace-nowrap font-medium">
                            {svc.subsystem}
                          </td>

                          {/* Region */}
                          <td className="py-4 px-4 text-xs text-[#757575] whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5F5F5] text-[#565F6D] text-[11px] font-medium">
                              <Globe className="w-3 h-3 text-[#757575]" />
                              {svc.region.split(" ")[0]}
                            </span>
                          </td>

                          {/* Latency */}
                          <td className="py-4 px-4 text-xs font-semibold text-center whitespace-nowrap">
                            {svc.status === "down" ? (
                              <span className="text-red-600 font-bold">Timeout</span>
                            ) : (
                              <span
                                className={
                                  svc.latencyMs > 500
                                    ? "text-amber-600 font-bold"
                                    : "text-[#1A1A1A]"
                                }
                              >
                                {svc.latencyMs}ms
                              </span>
                            )}
                          </td>

                          {/* 30d Uptime */}
                          <td className="py-4 px-4 text-xs text-center font-medium text-[#1A1A1A] whitespace-nowrap">
                            {svc.uptime30d}%
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                                svc.status === "operational"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : svc.status === "degraded"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              <span className="capitalize">{svc.status}</span>
                            </span>
                          </td>

                          {/* Inspect Side Modal Trigger */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedService(svc);
                              }}
                              className="px-3 py-1 rounded-full text-xs font-semibold text-[#D63C1E] bg-[#D63C1E]/5 hover:bg-[#D63C1E] hover:text-white transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>Inspect</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-xs text-[#757575]">
                          No services found matching your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="py-4 px-6 border-t border-[#F5F5F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#757575]">
                <div>
                  Showing <span className="font-semibold text-[#1A1A1A]">{filteredServices.length}</span> of{" "}
                  <span className="font-semibold text-[#1A1A1A]">32</span> platform services
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>31 Operational</span>
                  <span className="mx-2">•</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>1 Degraded</span>
                  <span className="mx-2">•</span>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>1 Down</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: INCIDENT & AUDIT LOG
             ======================================================== */}
          {activeTab === "incidents" && (
            <div className="bg-white rounded-3xl border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-4">
                <div>
                  <h2 className="text-base font-bold text-[#1A1A1A]">Platform Incidents & Maintenance Records</h2>
                  <p className="text-xs text-[#757575] mt-0.5">
                    Post-mortems, degraded upstream relays, and failover validation logs.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                    1 Active Degradation
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="p-5 rounded-2xl border border-[#EAEAEA] bg-[#FDFDFD] hover:bg-white hover:border-[#D63C1E]/40 hover:shadow-md transition-all space-y-3 cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            inc.severity === "critical"
                              ? "bg-red-500 animate-ping"
                              : inc.severity === "warning"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        <h4 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#D63C1E] transition-colors">{inc.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#757575]">{inc.timestamp}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            INCIDENT_STATUS_SPECS[inc.status]?.badgeClass || "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {inc.status}
                        </span>
                        <div className="w-7 h-7 rounded-full border border-[#EAEAEA] flex items-center justify-center text-gray-400 group-hover:text-[#1A1A1A] group-hover:border-[#1A1A1A] transition-colors bg-white">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-[#565F6D] grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[#F5F5F5]">
                      <div>
                        <span className="text-[#757575] font-medium">Service Affected: </span>
                        <span className="font-semibold text-[#1A1A1A]">{inc.serviceName}</span>
                      </div>
                      <div>
                        <span className="text-[#757575] font-medium">Duration: </span>
                        <span className="font-semibold text-[#1A1A1A]">{inc.duration}</span>
                      </div>
                      <div>
                        <span className="text-[#757575] font-medium">Impact Scope: </span>
                        <span className="font-semibold text-[#1A1A1A]">{inc.impact}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl text-xs text-[#1A1A1A] border border-[#EAEAEA] font-medium">
                      <span className="font-bold text-[#1A1A1A]">Investigation / Root Cause: </span>
                      {inc.rootCause}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          SIDE MODAL 1: SERVICE INSPECTION & DIAGNOSTICS (SLIDES FROM RIGHT)
         ======================================================== */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedService(null)}
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
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1A1A]">
                        {selectedService.name}
                      </h3>
                      <p className="text-xs text-[#757575]">{selectedService.id} • {selectedService.category}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#757575] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      selectedService.status === "operational"
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-800"
                        : selectedService.status === "degraded"
                        ? "bg-amber-50/60 border-amber-200 text-amber-800"
                        : "bg-red-50/60 border-red-200 text-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-current" />
                      <div>
                        <div className="font-bold text-sm capitalize">{selectedService.status}</div>
                        <div className="text-[11px] opacity-80">Last check: {selectedService.lastCheck}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePingService(selectedService)}
                      className="px-3.5 py-1.5 rounded-full bg-white font-semibold text-xs shadow-xs hover:shadow-sm border border-current/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Ping Probe</span>
                    </button>
                  </div>

                  {/* Telemetry Gauge Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA]">
                      <div className="text-[#757575] text-[11px] font-medium">Live Latency</div>
                      <div className="text-xl font-extrabold text-[#1A1A1A] mt-1">
                        {selectedService.status === "down" ? "Timeout" : `${selectedService.latencyMs} ms`}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium mt-1">Target: &lt; 50ms</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA]">
                      <div className="text-[#757575] text-[11px] font-medium">30-Day Uptime</div>
                      <div className="text-xl font-extrabold text-[#1A1A1A] mt-1">
                        {selectedService.uptime30d}%
                      </div>
                      <div className="text-[10px] text-[#757575] font-medium mt-1">SLA Standard: 99.9%</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA]">
                      <div className="text-[#757575] text-[11px] font-medium">CPU Utilization</div>
                      <div className="text-xl font-extrabold text-[#1A1A1A] mt-1">
                        {selectedService.cpuLoad}%
                      </div>
                      <div className="w-full bg-[#EAEAEA] h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-[#D63C1E] h-full rounded-full"
                          style={{ width: `${selectedService.cpuLoad}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA]">
                      <div className="text-[#757575] text-[11px] font-medium">Memory Allocation</div>
                      <div className="text-xl font-extrabold text-[#1A1A1A] mt-1">
                        {selectedService.memoryLoad}%
                      </div>
                      <div className="w-full bg-[#EAEAEA] h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${selectedService.memoryLoad}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Endpoint Details */}
                  <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] space-y-3">
                    <div className="font-bold text-[#1A1A1A] text-xs">Node Architecture</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1 border-b border-[#F5F5F5]">
                        <span className="text-[#757575]">Endpoint URI:</span>
                        <span className="font-mono text-[11px] text-[#1A1A1A] bg-[#F5F5F5] px-2 py-0.5 rounded">
                          {selectedService.endpoint}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-[#F5F5F5]">
                        <span className="text-[#757575]">Hosting Region:</span>
                        <span className="font-semibold text-[#1A1A1A]">{selectedService.region}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[#757575]">Error Rate (24h):</span>
                        <span className="font-semibold text-[#1A1A1A]">{selectedService.errorRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Subsystem Purpose */}
                  <div>
                    <h4 className="font-bold text-[#1A1A1A] mb-1.5">Operational Purpose</h4>
                    <p className="text-[#565F6D] leading-relaxed bg-[#F9F9F9] p-3.5 rounded-xl border border-[#EAEAEA]">
                      {selectedService.description}
                    </p>
                  </div>

                  {/* Incident History for this service */}
                  <div>
                    <h4 className="font-bold text-[#1A1A1A] mb-2">Service Incident History</h4>
                    {selectedService.incidents.length > 0 ? (
                      <div className="space-y-2">
                        {selectedService.incidents.map((inc) => (
                          <div
                            key={inc.id}
                            className="p-3 rounded-xl border border-[#EAEAEA] bg-white space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#1A1A1A]">{inc.title}</span>
                              <span className="text-[10px] text-[#757575]">{inc.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-[#757575]">{inc.notes}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-800 text-[11px]">
                        No outages or degraded incidents recorded in the last 30 days.
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Operational Controls */}
                <div className="p-5 border-t border-[#EAEAEA] bg-white flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleRestartService(selectedService)}
                    className="h-10 px-4 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rolling Restart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Sync Buffer Flushed", {
                        description: `All pending buffers for ${selectedService.name} cleared.`,
                      });
                    }}
                    className="h-10 px-5 rounded-full bg-[#1A1A1A] text-white hover:bg-black text-xs font-semibold transition-all cursor-pointer"
                  >
                    Flush Cache
                  </button>
                </div>
              </motion.aside>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          SIDE MODAL 2: INCIDENT RECORD & STATUS LIFECYCLE (SLIDES FROM RIGHT)
         ======================================================== */}
      <AnimatePresence>
        {selectedIncident && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedIncident(null)}
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
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#757575]">
                          {selectedIncident.id}
                        </span>
                        <span className="text-xs text-[#757575]">•</span>
                        <span className="text-xs font-semibold text-[#1A1A1A]">
                          {selectedIncident.serviceName}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#1A1A1A] mt-0.5 line-clamp-1">
                        {selectedIncident.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedIncident(null)}
                    className="w-8 h-8 rounded-full border border-[#EAEAEA] flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#565F6D]">
                  {/* Status Dropdown Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider block">
                        Lifecycle Status
                      </label>
                      <span className="text-[11px] text-[#757575]">
                        Click to change incident state
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full h-12 px-4 rounded-xl border border-[#EAEAEA] bg-white hover:bg-[#F9F9F9] focus:outline-none focus:border-[#D63C1E] transition-all flex items-center justify-between text-xs text-[#1A1A1A] cursor-pointer shadow-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              INCIDENT_STATUS_SPECS[selectedIncident.status]?.dotClass || "bg-gray-400"
                            }`}
                          />
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                              INCIDENT_STATUS_SPECS[selectedIncident.status]?.badgeClass ||
                              "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {selectedIncident.status}
                          </span>
                          <span className="text-xs text-[#757575] truncate">
                            {INCIDENT_STATUS_SPECS[selectedIncident.status]?.desc}
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-[#757575] shrink-0 ml-2" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-[calc(100vw-5rem)] max-w-md rounded-2xl p-2 bg-white shadow-2xl border border-[#EAEAEA] z-[70] space-y-1.5"
                      >
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                          Select Incident Status
                        </div>
                        {(
                          ["Identified", "Pending", "Resolved", "Investigation"] as IncidentStatus[]
                        ).map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleUpdateIncidentStatus(status)}
                            className={`p-3 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 border ${
                              selectedIncident.status === status
                                ? "bg-[#D63C1E]/5 border-[#D63C1E]/30"
                                : "hover:bg-[#F5F5F5] border-transparent"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${INCIDENT_STATUS_SPECS[status].dotClass}`}
                                />
                                <span className="font-bold text-xs text-[#1A1A1A]">{status}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                    INCIDENT_STATUS_SPECS[status].badgeClass
                                  }`}
                                >
                                  {status}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#757575] leading-snug mt-1">
                                {INCIDENT_STATUS_SPECS[status].desc}
                              </p>
                            </div>
                            {selectedIncident.status === status && (
                              <CheckCircle2 className="w-4 h-4 text-[#D63C1E] shrink-0 mt-0.5" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Incident Telemetry & Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-[#EAEAEA] bg-white">
                      <span className="text-[10px] uppercase font-bold text-[#757575] tracking-wider block">
                        First Detected
                      </span>
                      <span className="text-xs font-semibold text-[#1A1A1A] mt-1 block">
                        {selectedIncident.timestamp}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#EAEAEA] bg-white">
                      <span className="text-[10px] uppercase font-bold text-[#757575] tracking-wider block">
                        Duration / TTR
                      </span>
                      <span className="text-xs font-semibold text-[#1A1A1A] mt-1 block">
                        {selectedIncident.duration}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#EAEAEA] bg-white">
                      <span className="text-[10px] uppercase font-bold text-[#757575] tracking-wider block">
                        Severity Level
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            selectedIncident.severity === "critical"
                              ? "bg-red-500 animate-pulse"
                              : selectedIncident.severity === "warning"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        <span className="text-xs font-semibold text-[#1A1A1A] uppercase">
                          {selectedIncident.severity}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#EAEAEA] bg-white">
                      <span className="text-[10px] uppercase font-bold text-[#757575] tracking-wider block">
                        Affected Microservice
                      </span>
                      <span className="text-xs font-semibold text-[#1A1A1A] mt-1 block truncate">
                        {selectedIncident.serviceName}
                      </span>
                    </div>
                  </div>

                  {/* Operational Impact Scope (Clean border, NO gray background, text-black) */}
                  <div className="p-4 rounded-2xl border border-[#EAEAEA] bg-white space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#757575] block">
                      Operational Impact Scope
                    </span>
                    <p className="text-black font-medium text-xs leading-relaxed">
                      {selectedIncident.impact}
                    </p>
                  </div>

                  {/* Root Cause Analysis (Clean border, NO gray background, text-black) */}
                  <div className="p-4 rounded-2xl border border-[#EAEAEA] bg-white space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#757575] block">
                      Root Cause Analysis & Triage Notes
                    </span>
                    <p className="text-black font-medium text-xs leading-relaxed">
                      {selectedIncident.rootCause}
                    </p>
                  </div>

                  {/* Audit Trail & Protocol Notes */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-[#1A1A1A] text-xs">Security & Audit History</h4>
                    <div className="p-3.5 rounded-xl border border-[#EAEAEA] bg-white space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D63C1E] mt-1.5 shrink-0" />
                        <div>
                          <p className="text-[11px] font-bold text-[#1A1A1A]">
                            Incident recorded by Prometheus SRE Probe
                          </p>
                          <p className="text-[10px] text-[#757575]">
                            {selectedIncident.timestamp} • Automated telemetry trigger
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-[11px] font-bold text-[#1A1A1A]">
                            Current Status: {selectedIncident.status}
                          </p>
                          <p className="text-[10px] text-[#757575]">
                            Updated via MyShop SRE Central Console
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 border-t border-[#EAEAEA] bg-white flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedIncident(null)}
                    className="h-10 px-5 rounded-full border border-[#EAEAEA] text-[#1A1A1A] hover:bg-[#F5F5F5] text-xs font-semibold transition-all cursor-pointer"
                  >
                    Close
                  </button>

                  {selectedIncident.status !== "Resolved" ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateIncidentStatus("Resolved")}
                      className="h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Resolved</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateIncidentStatus("Investigation")}
                      className="h-10 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-open Investigation</span>
                    </button>
                  )}
                </div>
              </motion.aside>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          SIDE MODAL 3: RUN GLOBAL DIAGNOSTICS (SLIDES FROM RIGHT)
         ======================================================== */}
      <AnimatePresence>
        {diagnosticsModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                if (!runningDiagnostics) setDiagnosticsModalOpen(false);
              }}
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
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1A1A]">
                        Live Platform Traceroute & Diagnostics
                      </h3>
                      <p className="text-xs text-[#757575]">Simulating multi-region health probes</p>
                    </div>
                  </div>
                  {!runningDiagnostics && (
                    <button
                      type="button"
                      onClick={() => setDiagnosticsModalOpen(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#757575] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
                  {/* Progress Status Card */}
                  <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[#1A1A1A]">
                        {runningDiagnostics ? "Running Diagnostics Probe..." : "Diagnostic Run Finished"}
                      </span>
                      <span className="text-[11px] font-semibold text-[#D63C1E]">
                        {diagnosticsStep >= 6 ? "100%" : `${Math.floor((diagnosticsStep / 6) * 100)}%`}
                      </span>
                    </div>
                    <div className="w-full bg-[#EAEAEA] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#D63C1E] h-full transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(100, (diagnosticsStep / 6) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Traceroute Step List */}
                  <div className="space-y-3">
                    {/* Step 1: Supabase Database Pooler */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        diagnosticsStep >= 1
                          ? "bg-white border-emerald-200"
                          : "bg-[#F9F9F9] border-[#EAEAEA] opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {diagnosticsStep > 1 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : diagnosticsStep === 1 ? (
                          <RefreshCw className="w-4 h-4 text-[#D63C1E] animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-[#1A1A1A]">Supabase PostgreSQL Pooler</div>
                          <div className="text-[10px] text-[#757575]">ap-southeast-1 • 5432 pgBouncer</div>
                        </div>
                      </div>
                      {diagnosticsStep >= 2 && (
                        <span className="text-[11px] font-bold text-emerald-600">14ms OK</span>
                      )}
                    </div>

                    {/* Step 2: PayMongo Webhook Listener */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        diagnosticsStep >= 2
                          ? "bg-white border-emerald-200"
                          : "bg-[#F9F9F9] border-[#EAEAEA] opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {diagnosticsStep > 2 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : diagnosticsStep === 2 ? (
                          <RefreshCw className="w-4 h-4 text-[#D63C1E] animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-[#1A1A1A]">PayMongo Payment Webhooks</div>
                          <div className="text-[10px] text-[#757575]">TLS 1.3 Signature Handshake</div>
                        </div>
                      </div>
                      {diagnosticsStep >= 3 && (
                        <span className="text-[11px] font-bold text-emerald-600">38ms OK</span>
                      )}
                    </div>

                    {/* Step 3: Semaphore SMS Gateway */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        diagnosticsStep >= 3
                          ? "bg-white border-red-200"
                          : "bg-[#F9F9F9] border-[#EAEAEA] opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {diagnosticsStep > 3 ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : diagnosticsStep === 3 ? (
                          <RefreshCw className="w-4 h-4 text-[#D63C1E] animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-[#1A1A1A]">Semaphore Local SMS Relay</div>
                          <div className="text-[10px] text-[#757575]">ph-manila telco route</div>
                        </div>
                      </div>
                      {diagnosticsStep >= 4 && (
                        <span className="text-[11px] font-bold text-amber-600">504 Degraded</span>
                      )}
                    </div>

                    {/* Step 4: POS Offline Sync Queue */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        diagnosticsStep >= 4
                          ? "bg-white border-emerald-200"
                          : "bg-[#F9F9F9] border-[#EAEAEA] opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {diagnosticsStep > 4 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : diagnosticsStep === 4 ? (
                          <RefreshCw className="w-4 h-4 text-[#D63C1E] animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-[#1A1A1A]">POS Offline Sync WebSocket</div>
                          <div className="text-[10px] text-[#757575]">Heartbeat & Delta Broadcast</div>
                        </div>
                      </div>
                      {diagnosticsStep >= 5 && (
                        <span className="text-[11px] font-bold text-emerald-600">22ms OK</span>
                      )}
                    </div>

                    {/* Step 5: Cloudflare CDN & S3 Invoices */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        diagnosticsStep >= 5
                          ? "bg-white border-emerald-200"
                          : "bg-[#F9F9F9] border-[#EAEAEA] opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {diagnosticsStep >= 6 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : diagnosticsStep === 5 ? (
                          <RefreshCw className="w-4 h-4 text-[#D63C1E] animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-[#1A1A1A]">Cloudflare Edge & S3 Storage</div>
                          <div className="text-[10px] text-[#757575]">PDF Receipts & Invoices CDN</div>
                        </div>
                      </div>
                      {diagnosticsStep >= 6 && (
                        <span className="text-[11px] font-bold text-emerald-600">12ms OK</span>
                      )}
                    </div>
                  </div>

                  {/* Summary Box */}
                  {diagnosticsStep >= 6 && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Core Platform Resilient</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Checkout transactions and database persistence are operating normally with 99.98% health. Only Semaphore SMS relay is encountering upstream timeouts; secondary failover route is ready.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="p-5 border-t border-[#EAEAEA] bg-white flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={runningDiagnostics}
                    onClick={() => setDiagnosticsModalOpen(false)}
                    className="h-10 px-5 rounded-full bg-[#1A1A1A] text-white hover:bg-black text-xs font-semibold transition-all cursor-pointer disabled:opacity-40"
                  >
                    Done
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
