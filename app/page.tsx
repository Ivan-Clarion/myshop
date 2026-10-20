"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  QrCode,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Printer,
  MessageCircle,
  ShieldCheck,
  Check,
  Mail,
  DollarSign,
} from "lucide-react";

import emblemLogo from "@/app/assets/logo/emblem.png";
import heroPhoneImage from "@/app/assets/images/mobile_app_hero.png";
import mockupDashboard from "@/app/assets/images/mockup_dashboard.png";
import mockupScanner from "@/app/assets/images/mockup_scanner.png";

import type { Variants } from "framer-motion";

// Animation Variants
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] font-sans antialiased selection:bg-[#FFDAD3] selection:text-[#3E0500]">
      {/* 1. Header / Navigation */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 bg-white/85 backdrop-blur-xl border-b border-[#EAEAEA]/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)]"
      >
        <div className="h-20 max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
            >
              <Image
                src={emblemLogo}
                alt="MyShop Emblem Logo"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </motion.div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              <span className="text-[#D63C1E]">My</span>Shop
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#overview"
              className="text-sm font-semibold text-[#D63C1E] transition-colors"
            >
              Overview
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-[#757575] hover:text-[#1A1A1A] transition-colors"
            >
              Features
            </a>
            <a
              href="#download"
              className="text-sm font-medium text-[#757575] hover:text-[#1A1A1A] transition-colors"
            >
              Downloads
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-[#757575] hover:text-[#1A1A1A] transition-colors"
            >
              Pricing
            </a>
            <a
              href="#support"
              className="text-sm font-medium text-[#757575] hover:text-[#1A1A1A] transition-colors"
            >
              Support
            </a>
          </nav>

          {/* Action CTAs - "Get Started" is visible on mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/portal"
              className="inline-flex items-center justify-center h-10 sm:h-11 px-3 sm:px-5 rounded-full text-xs sm:text-sm font-medium text-[#1A232F] bg-white border border-[#EAEAEA] hover:bg-[#F3F3F3] shadow-sm transition-all active:scale-[0.98]"
            >
              Admin Portal
            </Link>
            <a
              href="#download"
              className="inline-flex items-center justify-center h-10 sm:h-11 px-4 sm:px-6 rounded-full bg-[#D63C1E] text-white text-xs sm:text-sm font-semibold shadow-[0_8px_20px_rgba(214,60,30,0.25)] hover:bg-[#B22204] active:scale-[0.98] transition-all"
            >
              Get Started
            </a>
          </div>
        </div>
      </motion.header>

      <main className="pt-20">
        {/* 2. Hero Section */}
        <section
          id="overview"
          className="relative overflow-hidden px-4 sm:px-6 md:px-8 py-16 md:py-24"
        >
          {/* Animated Flowing Neo-Fintech Gradient Mesh */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Drifting vermilion ambient light orb */}
            <motion.div
              animate={{
                x: [0, 80, -40, 0],
                y: [0, -50, 40, 0],
                scale: [1, 1.25, 0.9, 1],
                rotate: [0, 45, -20, 0],
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-24 -left-16 w-[560px] h-[560px] rounded-full bg-gradient-to-tr from-[#D63C1E]/30 via-[#E64A19]/20 to-transparent blur-[120px] mix-blend-multiply"
            />

            {/* Drifting Azure/Fintech blue light orb */}
            <motion.div
              animate={{
                x: [0, -70, 50, 0],
                y: [0, 60, -40, 0],
                scale: [1, 1.3, 0.95, 1],
                rotate: [0, -40, 30, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute top-1/4 -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#0078C7]/25 via-[#005F9F]/15 to-transparent blur-[130px] mix-blend-multiply"
            />

            {/* Pulsing center warm coral accent orb */}
            <motion.div
              animate={{
                x: [0, 50, -60, 0],
                y: [0, 40, -50, 0],
                scale: [0.9, 1.2, 1, 0.9],
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute -bottom-24 left-1/4 w-[480px] h-[480px] rounded-full bg-gradient-to-r from-[#FF6B4A]/20 via-[#FFB4A4]/15 to-transparent blur-[110px] mix-blend-multiply"
            />

            {/* Flowing linear gradient wash overlay with animated position */}
            <motion.div
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 200%",
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, rgba(214, 60, 30, 0.1) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(0, 120, 199, 0.08) 0%, transparent 60%)",
              }}
              className="absolute inset-0 opacity-80"
            />
          </div>

          <div className="relative max-w-[1200px] mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Hero Text */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="lg:col-span-7 flex flex-col space-y-6 text-center md:text-left"
              >
                <motion.h1
                  variants={fadeInUp}
                  className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-[#1A1A1A] leading-[1.12]"
                >
                  No More Lost Notebooks.
                  <br className="hidden sm:inline" />
                  <span className="text-[#D63C1E]">
                    {" "}
                    No More Uncounted Sales.
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-base sm:text-lg text-[#757575] max-w-xl mx-auto md:mx-0 leading-relaxed font-normal"
                >
                  Turn your Android phone into a complete retail register. MyShop
                  helps neighborhood stores track daily cash sales, manage live
                  inventory, and settle customer credit in seconds.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2"
                >
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="#download"
                    className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#D63C1E] text-white text-base font-semibold shadow-[0_12px_24px_rgba(214,60,30,0.24)] hover:bg-[#B22204] transition-all"
                  >
                    Download MyShop Free
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="#pricing"
                    className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-full bg-white text-[#1A1A1A] text-base font-medium border border-[#EAEAEA] shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:bg-[#F3F3F3] transition-all"
                  >
                    See Pricing
                  </motion.a>
                </motion.div>

                {/* Micro Proof Floating Metric Cards with gentle floating animation */}
                <motion.div
                  variants={fadeInUp}
                  className="pt-6 relative w-full overflow-hidden sm:overflow-visible pb-4"
                >
                  <div className="flex items-center justify-center relative min-h-[190px] w-full">
                    {/* Badge 1: Settled Credit */}
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      whileHover={{ scale: 1.05, rotate: 0 }}
                      className="absolute left-0 top-3 w-[205px] sm:w-[225px] bg-white rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#EAEAEA] -rotate-6 transition-all z-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#DAE3F4] text-[#131C28] text-[10px] font-bold flex items-center justify-center">
                            MR
                          </div>
                          <span className="text-xs text-[#757575] truncate max-w-[85px] font-medium">
                            M. Ramos
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#00A651]/15 text-[#00A651] text-[10px] font-bold tracking-wide">
                          SETTLED
                        </span>
                      </div>
                      <div className="text-lg font-bold text-[#1A1A1A]">
                        +₱350.00
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-[#757575]">Credit Settled</span>
                        <span className="text-[#D63C1E] font-medium">GCash</span>
                      </div>
                    </motion.div>

                    {/* Badge 2: Inventory */}
                    <motion.div
                      animate={{ y: [-2, 4, -2] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      whileHover={{ scale: 1.08 }}
                      className="relative z-10 w-[225px] sm:w-[245px] bg-white rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-[#EAEAEA] -translate-y-1 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#D63C1E]/10 text-[#D63C1E] text-[11px] font-bold">
                          -2 pcs
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#00A651]/15 text-[#00A651] text-[11px] font-bold">
                          48 In Stock
                        </span>
                      </div>
                      <div className="text-lg font-bold text-[#1A1A1A] truncate">
                        Milk Powder 33g
                      </div>
                      <div className="mt-1 text-xs text-[#757575]">
                        Live Inventory Sync
                      </div>
                    </motion.div>

                    {/* Badge 3: Cash POS */}
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      whileHover={{ scale: 1.05, rotate: 0 }}
                      className="absolute right-0 top-3 w-[205px] sm:w-[225px] bg-white rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#EAEAEA] rotate-6 transition-all z-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#757575]">
                          Cash Tendered
                        </span>
                        <span className="text-[11px] text-[#757575] font-semibold">
                          ₱200.00
                        </span>
                      </div>
                      <div className="text-lg font-bold text-[#00A651]">
                        Change: ₱65.00
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-[#757575]">
                        <span>Total: ₱135.00</span>
                        <span className="text-[#D63C1E] font-medium">Cash POS</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column: Phone Frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className="lg:col-span-5 relative w-full"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="relative mx-auto w-[300px] sm:w-[330px] rounded-[48px] p-3 bg-[#1E2022] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.12)]"
                  >
                    {/* Top Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-28 bg-[#1E2022] rounded-b-2xl z-20 flex items-center justify-center">
                      <div className="w-10 h-1.5 bg-neutral-800 rounded-full" />
                    </div>

                    {/* Screen View */}
                    <div className="relative w-full rounded-[38px] overflow-hidden bg-[#F9F9F9] shadow-inner aspect-[9/19.5]">
                      <Image
                        src={heroPhoneImage}
                        alt="MyShop Mobile POS Dashboard"
                        fill
                        sizes="(max-width: 768px) 300px, 330px"
                        className="object-cover object-top"
                        priority
                      />
                    </div>

                    {/* Hardware Buttons */}
                    <div className="absolute -left-[14px] top-24 w-[3px] h-9 bg-neutral-700 rounded-l-sm" />
                    <div className="absolute -left-[14px] top-36 w-[3px] h-12 bg-neutral-700 rounded-l-sm" />
                    <div className="absolute -left-[14px] top-52 w-[3px] h-12 bg-neutral-700 rounded-l-sm" />
                    <div className="absolute -right-[14px] top-32 w-[3px] h-16 bg-neutral-700 rounded-r-sm" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. Operational Architecture & Value Pillars */}
        <section
          id="features"
          className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-14 text-center md:text-left"
          >
            <span className="text-xs uppercase tracking-widest text-[#D63C1E] font-bold">
              CORE CAPABILITIES
            </span>
            <h2 className="text-3xl md:text-[38px] font-bold text-[#1A1A1A] mt-2 tracking-tight">
              Engineered for the reality of everyday retail.
            </h2>
            <p className="text-base md:text-lg text-[#757575] mt-2 max-w-2xl leading-relaxed">
              Replace manual notebooks and slow mental math with lightning-fast
              mobile tools designed specifically for neighborhood storefronts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Barcode Scanner */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-[28px] border border-[#EAEAEA] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
            >
              <div
                className="h-52 w-full rounded-2xl relative flex items-center justify-center overflow-hidden border border-[#EAEAEA]/70"
                style={{
                  backgroundColor: "#FAFAFA",
                  backgroundImage:
                    "radial-gradient(circle, rgba(178, 34, 4, 0.16) 1.2px, transparent 1.2px)",
                  backgroundSize: "20px 20px",
                }}
              >
                <div className="relative bg-white px-5 py-4 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.06)] border border-[#EAEAEA] flex flex-col items-center gap-2">
                  <div className="w-11 h-11 rounded-full bg-[#D63C1E]/10 flex items-center justify-center text-[#D63C1E]">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-[#757575] font-medium">
                    Instant Scanner Ready
                  </span>
                  <span className="text-xl font-bold text-[#1A1A1A]">₱120.00</span>
                </div>
                <div className="absolute bottom-3 px-3 py-1 rounded-full bg-[#00A651]/15 text-[#00A651] text-xs font-semibold flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Barcode Matched
                </div>
              </div>
              <div className="pt-6">
                <h3 className="text-lg font-bold text-[#1A1A1A] leading-snug">
                  Turn Your Phone Camera into an Instant Barcode Scanner
                </h3>
                <p className="text-sm text-[#757575] mt-2 leading-relaxed">
                  Typing in prices manually or doing mental math during busy rush
                  hours creates long customer queues and short cash drawers.
                </p>
              </div>
            </motion.div>

            {/* Feature 2: Smart Credit Ledger */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-[28px] border border-[#EAEAEA] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
            >
              <div
                className="h-52 w-full rounded-2xl relative flex flex-col items-center justify-center overflow-hidden border border-[#EAEAEA]/70"
                style={{
                  backgroundColor: "#FAFAFA",
                  backgroundImage:
                    "radial-gradient(circle, rgba(178, 34, 4, 0.16) 1.2px, transparent 1.2px)",
                  backgroundSize: "20px 20px",
                }}
              >
                <div className="bg-white px-6 py-4 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.06)] border border-[#EAEAEA] flex flex-col items-center w-[210px]">
                  <span className="text-xl font-bold text-[#1A1A1A]">₱1,200</span>
                  <div className="w-full h-2 bg-[#EEEEEE] rounded-full mt-3 relative overflow-visible">
                    <div className="h-full w-2/3 bg-[#D63C1E] rounded-full" />
                    <div className="absolute top-1/2 left-2/3 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#D63C1E] shadow" />
                  </div>
                </div>
                <div className="mt-3 px-3 py-1 rounded-full bg-white border border-[#EAEAEA] shadow-sm flex items-center gap-1.5 text-[#1A1A1A] text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D63C1E]" /> Credit
                  Settled
                </div>
              </div>
              <div className="pt-6">
                <h3 className="text-lg font-bold text-[#1A1A1A] leading-snug">
                  A Smart Credit Ledger That Never Forgets a Debt
                </h3>
                <p className="text-sm text-[#757575] mt-2 leading-relaxed">
                  Loose sheets of paper and damaged notebooks (kwaderno) get lost,
                  wet, or disputed, causing stores to lose thousands in
                  uncollected debts.
                </p>
              </div>
            </motion.div>

            {/* Feature 3: Automatic Stock Counts */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-[28px] border border-[#EAEAEA] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
            >
              <div
                className="h-52 w-full rounded-2xl relative flex items-center justify-center overflow-hidden border border-[#EAEAEA]/70"
                style={{
                  backgroundColor: "#FAFAFA",
                  backgroundImage:
                    "radial-gradient(circle, rgba(178, 34, 4, 0.16) 1.2px, transparent 1.2px)",
                  backgroundSize: "20px 20px",
                }}
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border border-[#EAEAEA] flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border border-[#D63C1E]/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#D63C1E] text-white flex items-center justify-center shadow-md">
                        <Check className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -left-6 top-4 bg-white border border-[#EAEAEA] rounded-lg px-2.5 py-1 shadow-sm flex items-center gap-1">
                    <span className="text-[10px] text-[#757575] font-medium">
                      Item Ledger
                    </span>
                  </div>
                  <div className="absolute -right-6 bottom-4 bg-white border border-[#EAEAEA] rounded-lg px-2.5 py-1 shadow-sm flex items-center gap-1">
                    <span className="text-[10px] text-[#D63C1E] font-bold">
                      In Stock
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <h3 className="text-lg font-bold text-[#1A1A1A] leading-snug">
                  Automatic Stock Counts with Zero Guesswork
                </h3>
                <p className="text-sm text-[#757575] mt-2 leading-relaxed">
                  Store owners only realize they are out of best-selling goods
                  when a customer asks for them, resulting in lost daily revenue.
                </p>
              </div>
            </motion.div>

            {/* Feature 4: Professional Receipts */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-[28px] border border-[#EAEAEA] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
            >
              <div
                className="h-52 w-full rounded-2xl relative flex items-center justify-center overflow-hidden border border-[#EAEAEA]/70"
                style={{
                  backgroundColor: "#FAFAFA",
                  backgroundImage:
                    "radial-gradient(circle, rgba(178, 34, 4, 0.16) 1.2px, transparent 1.2px)",
                  backgroundSize: "20px 20px",
                }}
              >
                <div className="flex flex-col gap-2.5 items-start pl-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#D63C1E]" />
                    <div className="bg-white px-3 py-1.5 rounded-full border border-[#EAEAEA] shadow-sm flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-[#D63C1E]" />
                      <span className="text-xs font-semibold text-[#1A1A1A]">
                        SMS Receipt
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-4 border-l border-dashed border-neutral-300">
                    <div className="w-2 h-2 rounded-full bg-[#565F6D]" />
                    <div className="bg-white px-3 py-1.5 rounded-full border border-[#EAEAEA] shadow-sm flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-[#565F6D]" />
                      <span className="text-xs font-semibold text-[#1A1A1A]">
                        Messenger / Chat
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-4 border-l border-dashed border-neutral-300">
                    <div className="w-2 h-2 rounded-full bg-[#00A651]" />
                    <div className="bg-white px-3 py-1.5 rounded-full border border-[#EAEAEA] shadow-sm flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5 text-[#00A651]" />
                      <span className="text-xs font-semibold text-[#1A1A1A]">
                        Bluetooth Print
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <h3 className="text-lg font-bold text-[#1A1A1A] leading-snug">
                  Professional Receipts via SMS, Chat, or Bluetooth
                </h3>
                <p className="text-sm text-[#757575] mt-2 leading-relaxed">
                  Handwritten paper receipts look unprofessional, take too long
                  to write out, and paper rolls for traditional machines add up.
                </p>
              </div>
            </motion.div>

            {/* Feature 5: True Daily Profit */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-[28px] border border-[#EAEAEA] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden md:col-span-2 transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
            >
              <div
                className="h-52 w-full rounded-2xl relative flex items-center justify-center overflow-hidden border border-[#EAEAEA]/70"
                style={{
                  backgroundColor: "#FAFAFA",
                  backgroundImage:
                    "radial-gradient(circle, rgba(178, 34, 4, 0.16) 1.2px, transparent 1.2px)",
                  backgroundSize: "20px 20px",
                }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.06)] border border-[#EAEAEA] flex flex-col items-center w-24 sm:w-28 text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#D63C1E]/10 flex items-center justify-center text-[#D63C1E] mb-2">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-[#757575]">Net Margin</span>
                    <span className="text-base font-bold text-[#00A651] mt-0.5">
                      +34.2%
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-[0_14px_30px_rgba(0,0,0,0.08)] border border-[#D63C1E]/30 flex flex-col items-center w-28 sm:w-32 text-center scale-105 z-10">
                    <div className="w-11 h-11 rounded-xl bg-[#D63C1E] text-white flex items-center justify-center mb-2 shadow-sm">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] text-[#757575] font-semibold">
                      Daily Profit
                    </span>
                    <span className="text-lg font-bold text-[#1A1A1A] mt-0.5">
                      ₱3,840
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.06)] border border-[#EAEAEA] flex flex-col items-center w-24 sm:w-28 text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#0078C7]/15 flex items-center justify-center text-[#0078C7] mb-2">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-[#757575]">
                      Capital Safe
                    </span>
                    <span className="text-base font-bold text-[#1A1A1A] mt-0.5">
                      100%
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <h3 className="text-lg font-bold text-[#1A1A1A] leading-snug">
                  Know Your True Daily Profit in One Tap
                </h3>
                <p className="text-sm text-[#757575] mt-2 leading-relaxed">
                  Store owners spend an hour every evening with a calculator
                  trying to determine whether they actually made a profit or just
                  recovered capital.
                </p>
              </div>
            </motion.div>
          </div>

          {/* 4. App Download Call to Action Banner */}
          <motion.div
            id="download"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="mt-20 bg-white rounded-[38px] border border-[#EAEAEA] p-6 sm:p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#D63C1E]/10 blur-[100px] pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] leading-tight">
                  Download the App and Start Running a Smarter Store Today!
                </h2>
                <p className="text-base sm:text-lg text-[#757575] max-w-xl leading-relaxed">
                  Take control of your daily store operations with instant mobile
                  POS and automated ledgers. Track your sales, stay organized,
                  and grow your business — right from your pocket.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  {/* Google Play Button */}
                  <motion.a
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    href="#"
                    className="inline-flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white px-5 sm:px-6 py-3.5 rounded-full shadow-md transition-colors"
                  >
                    <svg
                      className="w-6 h-6 fill-current"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a2.036 2.036 0 0 1-.61-.318c-.62-.51-.999-1.29-.999-2.148V4.28c0-.858.379-1.637.999-2.148.19-.156.402-.266.609-.318zm11.233 11.237l2.254 2.254-11.83 6.83 9.576-9.084zm2.254-2.254L3.842 1.713l11.83 6.83-2.254 2.254zm1.055 1.055l3.208-1.852c1.139-.658 1.139-1.734 0-2.392l-3.208-1.852-2.106 2.106 2.106 2.106z" />
                    </svg>
                    <div className="text-left leading-none">
                      <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-300">
                        Get it on
                      </div>
                      <div className="text-[14px] font-semibold mt-1">
                        Google Play
                      </div>
                    </div>
                  </motion.a>

                  {/* App Store Button */}
                  <motion.a
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    href="#"
                    className="inline-flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white px-5 sm:px-6 py-3.5 rounded-full shadow-md transition-colors"
                  >
                    <svg
                      className="w-6 h-6 fill-current"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.13.64-2.79 1.41-.58.68-1.1 1.74-1 2.79 1.07.08 2.17-.58 2.78-1.33z" />
                    </svg>
                    <div className="text-left leading-none">
                      <div className="text-[10px] uppercase tracking-wider font-medium text-neutral-300">
                        Download on the
                      </div>
                      <div className="text-[14px] font-semibold mt-1">
                        App Store
                      </div>
                    </div>
                  </motion.a>
                </div>
              </div>

              {/* Dual Phone Showcase */}
              <div className="lg:col-span-5 relative flex items-center justify-center min-h-[360px] pt-4 lg:pt-0">
                <div className="relative w-full max-w-[380px] h-[340px] flex items-center justify-center">
                  {/* Phone 1: Dashboard Overview */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }}
                    className="absolute left-2 top-4 w-[185px] sm:w-[205px] rounded-[32px] p-2 bg-[#1E2022] shadow-[0_20px_45px_rgba(0,0,0,0.22)] -rotate-6 transition-all z-10"
                  >
                    <div className="w-full aspect-[9/18.5] rounded-[24px] overflow-hidden bg-[#F9F9F9] relative">
                      <Image
                        src={mockupDashboard}
                        alt="MyShop Store Dashboard Overview"
                        fill
                        sizes="205px"
                        className="object-cover object-top"
                      />
                    </div>
                  </motion.div>

                  {/* Phone 2: Counter Scanner */}
                  <motion.div
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }}
                    className="absolute right-2 -top-2 w-[190px] sm:w-[210px] rounded-[32px] p-2 bg-[#1E2022] shadow-[0_24px_50px_rgba(0,0,0,0.25)] rotate-6 transition-all z-20"
                  >
                    <div className="w-full aspect-[9/18.5] rounded-[24px] overflow-hidden bg-[#F9F9F9] relative">
                      <Image
                        src={mockupScanner}
                        alt="MyShop Live Counter Scanner"
                        fill
                        sizes="210px"
                        className="object-cover object-top"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 5. Pricing Section */}
        <section
          id="pricing"
          className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-14 text-center md:text-left"
          >
            <span className="text-xs uppercase tracking-widest text-[#D63C1E] font-bold">
              TRANSPARENT PRICING
            </span>
            <h2 className="text-3xl md:text-[38px] font-bold text-[#1A1A1A] mt-2 tracking-tight">
              Simple, fair pricing for every store size.
            </h2>
            <p className="text-base md:text-lg text-[#757575] mt-2 max-w-2xl leading-relaxed">
              Choose the plan that fits your counter. Upgrade or cancel anytime
              without hidden hardware fees.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Plan 1: Standard (Free) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-[28px] border border-[#EAEAEA] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase tracking-widest text-[#757575] font-bold">
                    STANDARD
                  </span>
                </div>
                <div className="mb-1">
                  <span className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
                    ₱0
                  </span>
                  <span className="text-sm text-[#757575] ml-1">forever</span>
                </div>
                <p className="text-[11px] text-[#757575] pb-4 border-b border-[#EAEAEA]">
                  No monthly fees • Unlimited basic access
                </p>
                <p className="text-xs text-[#757575] my-4 leading-relaxed min-h-[36px]">
                  Neighborhood start-up kiosks &amp; retail counters (Owner
                  operated)
                </p>

                <div className="space-y-2.5 pt-2 border-t border-[#EAEAEA]">
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>Basic POS &amp; Cash Counter Checkout</span>
                  </div>
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>1 Store Branch Location</span>
                  </div>
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>Owner-Only POS (0 Staff Invites)</span>
                  </div>
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>Up to 30 Product Items / SKUs</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="#download"
                  className="w-full inline-flex items-center justify-center h-10 px-4 rounded-full text-xs font-semibold text-[#1A1A1A] bg-[#F5F5F5] hover:bg-[#EEEEEE] transition-all"
                >
                  Start Free
                </a>
              </div>
            </motion.div>

            {/* Plan 2: Accessible (Micro) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-[28px] border border-[#EAEAEA] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase tracking-widest text-[#757575] font-bold">
                    ACCESSIBLE (MICRO)
                  </span>
                </div>
                <div className="mb-1">
                  <span className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
                    ₱99
                  </span>
                  <span className="text-sm text-[#757575] ml-1">/ month</span>
                </div>
                <p className="text-[11px] text-[#757575] pb-4 border-b border-[#EAEAEA]">
                  Billed monthly • Instant activation
                </p>
                <p className="text-xs text-[#757575] my-4 leading-relaxed min-h-[36px]">
                  Sari-sari stores &amp; single-operator counters (Up to 10
                  staff)
                </p>

                <div className="space-y-2.5 pt-2 border-t border-[#EAEAEA]">
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>100% Ad-Free POS &amp; Checkout</span>
                  </div>
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>1 Store Branch Location</span>
                  </div>
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>Up to 10 Staff Member Accounts</span>
                  </div>
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>Cloud Backup on Supabase</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="#download"
                  className="w-full inline-flex items-center justify-center h-10 px-4 rounded-full text-xs font-semibold text-[#1A1A1A] bg-[#F5F5F5] hover:bg-[#EEEEEE] transition-all"
                >
                  Choose Micro
                </a>
              </div>
            </motion.div>

            {/* Plan 3: Popular (Small) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-[28px] border-2 border-[#D63C1E] p-6 shadow-[0_20px_45px_rgba(214,60,30,0.12)] flex flex-col justify-between relative transition-shadow hover:shadow-[0_25px_50px_rgba(214,60,30,0.2)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase tracking-widest text-[#D63C1E] font-bold">
                    POPULAR (SMALL)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D63C1E]/10 text-[#D63C1E] text-[10px] font-bold tracking-wide uppercase">
                    Recommended
                  </span>
                </div>
                <div className="mb-1">
                  <span className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
                    ₱499
                  </span>
                  <span className="text-sm text-[#757575] ml-1">/ month</span>
                </div>
                <p className="text-[11px] text-[#757575] pb-4 border-b border-[#EAEAEA]">
                  Billed monthly • Instant activation
                </p>
                <p className="text-xs text-[#757575] my-4 leading-relaxed min-h-[36px]">
                  Groceries, bakeries, cafes &amp; pharmacies (Up to 99 staff)
                </p>

                <div className="space-y-2.5 pt-2 border-t border-[#EAEAEA]">
                  <div className="text-xs text-[#1A1A1A] font-semibold flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#D63C1E] flex-shrink-0" />
                    <span>Everything in Micro Tier</span>
                  </div>
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>Up to 99 Staff Member Accounts</span>
                  </div>
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>Live Cloud Inventory &amp; Sales Sync</span>
                  </div>
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>Staff Shift Clock-In &amp; Badges</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="#download"
                  className="w-full inline-flex items-center justify-center h-10 px-4 rounded-full text-xs font-semibold text-white bg-[#D63C1E] hover:bg-[#B22204] shadow-sm transition-all"
                >
                  Choose Small
                </a>
              </div>
            </motion.div>

            {/* Plan 4: Enterprise (Medium) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-[28px] border border-[#EAEAEA] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase tracking-widest text-[#757575] font-bold">
                    ENTERPRISE (MEDIUM)
                  </span>
                </div>
                <div className="mb-1">
                  <span className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
                    ₱1,499
                  </span>
                  <span className="text-sm text-[#757575] ml-1">/ month</span>
                </div>
                <p className="text-[11px] text-[#757575] pb-4 border-b border-[#EAEAEA]">
                  Billed monthly • Instant activation
                </p>
                <p className="text-xs text-[#757575] my-4 leading-relaxed min-h-[36px]">
                  Multi-branch retail networks &amp; commercial hubs (Unlimited
                  staff)
                </p>

                <div className="space-y-2.5 pt-2 border-t border-[#EAEAEA]">
                  <div className="text-xs text-[#1A1A1A] font-semibold flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#D63C1E] flex-shrink-0" />
                    <span>Everything in Small Tier</span>
                  </div>
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>Unlimited Staff Member Accounts</span>
                  </div>
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>Up to 5 Branches Included</span>
                  </div>
                  <div className="text-xs text-[#1A1A1A] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    <span>Enterprise Roles (Manager, Auditor)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="#download"
                  className="w-full inline-flex items-center justify-center h-10 px-4 rounded-full text-xs font-semibold text-[#1A1A1A] bg-[#F5F5F5] hover:bg-[#EEEEEE] transition-all"
                >
                  Choose Enterprise
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer
        id="support"
        className="w-full bg-white py-14 rounded-t-[38px] border-t border-[#EAEAEA] shadow-sm mt-12"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#EAEAEA]">
            {/* Footer Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src={emblemLogo}
                  alt="MyShop Emblem Logo"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <div className="text-xl font-bold tracking-tight">
                <span className="text-[#D63C1E]">My</span>
                <span className="text-[#1A1A1A]">Shop</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a
                href="#features"
                className="text-xs font-medium text-[#757575] hover:text-[#1A1A1A] transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-xs font-medium text-[#757575] hover:text-[#1A1A1A] transition-colors"
              >
                Pricing
              </a>
              <a
                href="#download"
                className="text-xs font-medium text-[#757575] hover:text-[#1A1A1A] transition-colors"
              >
                Mobile POS
              </a>
              <Link
                href="/portal"
                className="text-xs font-semibold text-[#D63C1E] hover:underline transition-colors"
              >
                Admin Portal
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
            <div className="flex items-center gap-2 text-[#757575]">
              <Mail className="w-4 h-4 text-[#D63C1E]" />
              <a
                href="mailto:tech.vangard@gmail.com"
                className="text-xs font-medium text-[#757575] hover:text-[#D63C1E] transition-colors"
              >
                tech.vangard@gmail.com
              </a>
            </div>

            <p className="text-xs text-[#757575]">
              &copy; 2026 MyShop Inc. All rights reserved. Designed for Philippine MSMEs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
