"use client";

import { Menu, Megaphone, Settings, User } from "lucide-react";
import { toast } from "sonner";

interface AdminHeaderProps {
  title: string;
  onOpenMobile?: () => void;
}

export function AdminHeader({ title, onOpenMobile }: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/85 backdrop-blur-xl border-b border-[#EAEAEA] shadow-[0_1px_8px_rgba(0,0,0,0.02)] z-30 flex items-center justify-between px-4 sm:px-6 md:px-8 transition-all">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu */}
        {onOpenMobile && (
          <button
            type="button"
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-full text-[#757575] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1A1A1A]">
          {title}
        </h1>
      </div>

      {/* Action Utilities */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#F5F5F5] border border-[#EAEAEA]">
        <button
          type="button"
          onClick={() =>
            toast.info("Broadcast Center", {
              description: "All 24 microservices are operating with 100% telemetry sync.",
            })
          }
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#565F6D] hover:bg-white hover:text-[#1A1A1A] hover:shadow-sm transition-all"
          title="Announcements"
        >
          <Megaphone className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            toast.info("Settings", {
              description: "System parameters, tier limits, and regional routing configured.",
            })
          }
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#565F6D] hover:bg-white hover:text-[#1A1A1A] hover:shadow-sm transition-all"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-[#E2E2E2] mx-0.5" />

        <button
          type="button"
          onClick={() =>
            toast.info("Operator Identity", {
              description: "Logged in as Alex Rivera (Super Admin)",
            })
          }
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#565F6D] hover:bg-white hover:text-[#1A1A1A] hover:shadow-sm transition-all"
          title="Profile"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
