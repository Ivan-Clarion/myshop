"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  FileBarChart2,
  Award,
  MessageSquareQuote,
  Users,
  Activity,
  LogOut,
  X,
} from "lucide-react";

import emblemLogo from "@/app/assets/logo/emblem.png";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Sales",
    href: "/sales",
    icon: Receipt,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileBarChart2,
  },
  {
    title: "Tier Management",
    href: "/tier-management",
    icon: Award,
  },
  {
    title: "Testimonials",
    href: "/testimonials",
    icon: MessageSquareQuote,
  },
  {
    title: "User Management",
    href: "/user-management",
    icon: Users,
  },
  {
    title: "System Health",
    href: "/system-health",
    icon: Activity,
  },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between transition-transform duration-300 border-r border-[#EAEAEA] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          {/* Header Brand */}
          <div className="p-6 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 flex-shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src={emblemLogo}
                  alt="MyShop Emblem Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
                <span className="text-[#D63C1E]">My</span>Shop
              </span>
            </Link>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden text-[#757575] hover:text-[#1A1A1A] p-1.5 rounded-full hover:bg-[#F3F3F3]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="h-px bg-[#EEEEEE] mx-6 mb-3" />

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-4">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-[#D63C1E]/10 text-[#D63C1E] font-semibold shadow-sm"
                      : "text-[#565F6D] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] font-medium"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#D63C1E]" : "text-[#565F6D]"}`} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Operator Profile Card */}
        <div className="flex flex-col p-4 mb-2">
          <div className="h-px bg-[#EEEEEE] mx-2 mb-4" />
          <div className="flex items-center justify-between p-2 pl-3 rounded-full bg-[#F3F3F3] border border-[#EAEAEA]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D63C1E] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                AR
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#1A1A1A] leading-none">
                  Alex Rivera
                </span>
                <span className="text-[10px] text-[#757575] leading-none mt-1 font-medium">
                  Super Admin
                </span>
              </div>
            </div>

            <Link
              href="/login"
              title="Sign Out"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#757575] hover:bg-white hover:text-[#D63C1E] hover:shadow-sm transition-all"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
