"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowLeft,
  Check,
  Lock,
  Mail,
  Loader2,
  Sparkles,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import emblemLogo from "@/app/assets/logo/emblem.png";

type AuthMode = "login" | "forgot_email" | "forgot_otp" | "forgot_reset" | "forgot_success";

export default function LoginPage() {
  const router = useRouter();

  // Mode & Transition state
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [mounted, setMounted] = useState(false);

  // Login form state
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberCounter, setRememberCounter] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authStage, setAuthStage] = useState<"idle" | "authenticating" | "syncing">("idle");

  // Forgot password flow state
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(45);
  const [isResending, setIsResending] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authMode === "forgot_otp" && resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [authMode, resendCountdown]);

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential || !password) {
      toast.error("Please enter both username/email and password");
      return;
    }

    setIsLoading(true);
    setAuthStage("authenticating");

    setTimeout(() => {
      setAuthStage("syncing");
      setTimeout(() => {
        setIsLoading(false);
        setAuthStage("idle");
        toast.success("Terminal Authenticated", {
          description: `Welcome back, ${credential}! Redirecting to Control Tower...`,
        });
        router.push("/dashboard");
      }, 800);
    }, 1000);
  };

  // Step 1: Submit Email for OTP
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please provide a valid operator email address");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthMode("forgot_otp");
      setResendCountdown(45);
      toast.success("Verification Code Sent", {
        description: `We've sent a 6-digit code to ${resetEmail}`,
      });
    }, 700);
  };

  // Step 2: OTP Inputs handling
  // Step 2: OTP Inputs handling (Strictly Numbers Only)
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/[^0-9]/g, "");
    const digit = cleaned ? cleaned.slice(-1) : "";

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input box if a digit was entered
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace navigation smoothly
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        e.preventDefault();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpRefs.current[index - 1]?.focus();
      }
      return;
    }

    // Allow navigation & clipboard control keys
    if (
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Enter" ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // Strictly prevent typing any non-numeric character
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || "";
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      otpRefs.current[nextIndex]?.focus();
      toast.info("Numeric verification code pasted");
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join("");
    if (fullCode.length < 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthMode("forgot_reset");
      toast.success("Security Code Verified", {
        description: "Please establish your new operator passcode.",
      });
    }, 700);
  };

  const handleResendOtp = () => {
    if (resendCountdown > 0) return;
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setResendCountdown(45);
      setOtp(["", "", "", "", "", ""]);
      toast.success("New Code Dispatched", {
        description: `Fresh 6-digit code sent to ${resetEmail}`,
      });
    }, 600);
  };

  // Step 3: Set New Password
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthMode("forgot_success");
      setPassword(newPassword);
      setCredential(resetEmail || credential);
      toast.success("Password Updated Successfully");
    }, 800);
  };

  // Demo Helpers
  const handleFillDemoLogin = () => {
    setCredential("admin@myshop.ph");
    setPassword("ShopAdmin2026!");
    toast.info("Demo credentials populated");
  };

  const handleFillDemoOtp = () => {
    setOtp(["8", "4", "2", "9", "1", "6"]);
    toast.info("Demo OTP code (842916) filled");
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] font-sans antialiased selection:bg-[#FFDAD3] selection:text-[#3E0500] flex flex-col justify-between items-center py-6 sm:py-10 px-4 relative overflow-hidden">
      {/* Ambient Animated Neo-Fintech Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 sm:-top-48 sm:-left-48 w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] rounded-full bg-[#D63C1E]/20 blur-[130px] mix-blend-multiply animate-pulse"
          style={{ animationDuration: "14s" }}
        />
        <div
          className="absolute -bottom-24 -right-24 sm:-bottom-48 sm:-right-48 w-[480px] h-[480px] sm:w-[680px] sm:h-[680px] rounded-full bg-[#0078C7]/15 blur-[140px] mix-blend-multiply animate-pulse"
          style={{ animationDuration: "18s", animationDelay: "2s" }}
        />
        <div className="absolute top-[35%] left-[25%] w-[320px] h-[320px] rounded-full bg-[#FFB4A4]/25 blur-[100px] mix-blend-multiply" />
      </div>

      {/* Top Header Row (Constrained strictly to 440px) */}
      <header
        className="w-full flex items-center justify-between mb-4 z-10"
        style={{ maxWidth: "440px" }}
      >
        {authMode === "login" ? (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#757575] hover:text-[#1A1A1A] transition-colors bg-white/80 hover:bg-white backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#EAEAEA] shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#757575] hover:text-[#1A1A1A] transition-colors bg-white/80 hover:bg-white backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#EAEAEA] shadow-sm active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        )}

        {authMode === "login" && (
          <button
            type="button"
            onClick={handleFillDemoLogin}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D63C1E] bg-white/80 hover:bg-white backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#EAEAEA] shadow-sm hover:border-[#D63C1E]/30 transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-[#D63C1E]" />
            <span>Demo Credentials</span>
          </button>
        )}

        {authMode === "forgot_otp" && (
          <button
            type="button"
            onClick={handleFillDemoOtp}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D63C1E] bg-white/80 hover:bg-white backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#EAEAEA] shadow-sm hover:border-[#D63C1E]/30 transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-[#D63C1E]" />
            <span>Fill Demo Code</span>
          </button>
        )}
      </header>

      {/* Main Card (Strictly 440px Width) */}
      <main className="w-full flex-1 flex flex-col items-center justify-center z-10 my-auto">
        <div className="w-full relative mx-auto" style={{ maxWidth: "440px" }}>
          <div
            className="rounded-[32px] p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col items-center text-center transition-all duration-300 relative border border-white/90 bg-white/85 backdrop-blur-xl"
            style={{
              boxShadow:
                "0 20px 50px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(255, 255, 255, 0.8) inset",
            }}
          >
            {/* Logo Emblem Header */}
            <div className="mb-5 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 p-2.5 border border-[#EAEAEA]">
                <Image
                  src={emblemLogo}
                  alt="MyShop Corporate Emblem"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
              </div>

              <div className="flex items-center justify-center leading-none select-none">
                <span className="text-3xl font-extrabold tracking-tight text-[#D63C1E]">
                  My
                </span>
                <span className="text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                  Shop
                </span>
              </div>
            </div>

            {/* ============================================================ */}
            {/* VIEW 1: LOGIN MODE */}
            {/* ============================================================ */}
            {authMode === "login" && (
              <div className="w-full">
                <div className="mb-6 max-w-sm">
                  <h1 className="text-xl font-bold text-[#1A1A1A] mb-1 tracking-tight">
                    System Access
                  </h1>
                  <p className="text-xs text-[#757575] leading-relaxed font-normal">
                    Sign in to the MyShop Admin Portal to oversee merchant operations,
                    telemetry, and live registers.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="w-full text-left flex flex-col gap-4">
                  {/* Credential Field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="adminCredential"
                      className="text-[11px] text-[#565F6D] font-bold uppercase tracking-wider pl-4"
                    >
                      Username / Email
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 flex items-center pointer-events-none text-[#757575]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="adminCredential"
                        type="text"
                        required
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                        placeholder="admin@myshop.ph or username"
                        className="w-full h-12 rounded-full pl-11 pr-5 bg-[#F3F3F3] text-[#1A1A1A] text-sm placeholder:text-[#757575]/60 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#D63C1E]/10 focus:border-[#D63C1E] shadow-sm transition-all duration-200 border border-[#EAEAEA]"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="adminPasscode"
                      className="text-[11px] text-[#565F6D] font-bold uppercase tracking-wider pl-4"
                    >
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 flex items-center pointer-events-none text-[#757575]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="adminPasscode"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-12 rounded-full pl-11 pr-11 bg-[#F3F3F3] text-[#1A1A1A] text-sm placeholder:text-[#757575]/60 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#D63C1E]/10 focus:border-[#D63C1E] shadow-sm transition-all duration-200 border border-[#EAEAEA]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-[#757575] hover:text-[#1A1A1A] transition-colors focus:outline-none cursor-pointer p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Counter & Forgot Password */}
                  <div className="flex items-center justify-between pt-0.5 px-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                      <div
                        onClick={() => setRememberCounter(!rememberCounter)}
                        className={`w-4 h-4 rounded-[5px] transition-all flex items-center justify-center shadow-inner cursor-pointer ${
                          rememberCounter
                            ? "bg-[#D63C1E] text-white"
                            : "bg-[#EEEEEE] border border-[#EAEAEA]"
                        }`}
                      >
                        {rememberCounter && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs text-[#757575] group-hover:text-[#1A1A1A] transition-colors">
                        Remember this counter
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(credential || "");
                        setAuthMode("forgot_email");
                      }}
                      className="text-xs text-[#D63C1E] hover:text-[#B22204] font-semibold transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      disabled={isLoading}
                      type="submit"
                      className="w-full h-12 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-sm font-semibold shadow-[0_10px_24px_rgba(214,60,30,0.25)] hover:shadow-[0_12px_28px_rgba(214,60,30,0.32)] transition-all duration-200 flex items-center justify-center cursor-pointer disabled:opacity-85 active:scale-[0.98]"
                    >
                      <AnimatePresence mode="wait">
                        {authStage === "idle" && (
                          <span className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            <span>Sign In to Portal</span>
                          </span>
                        )}

                        {authStage === "authenticating" && (
                          <span className="flex items-center gap-2 tracking-wide uppercase text-xs font-bold animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Authenticating Terminal...</span>
                          </span>
                        )}

                        {authStage === "syncing" && (
                          <span className="flex items-center gap-2 tracking-wide uppercase text-xs font-bold text-white">
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Register Synchronized!</span>
                          </span>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </form>

                {/* Single Device Session Concurrency Notice */}
                <div className="mt-6 pt-4 border-t border-[#EAEAEA] w-full flex items-center justify-center gap-2 text-[#757575] text-[11px] leading-tight">
                  <ShieldAlert className="w-4 h-4 text-[#D63C1E] flex-shrink-0" />
                  <span className="text-left">
                    Single-device concurrency enforced. Concurrently active terminals will be safely invalidated.
                  </span>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW 2: FORGOT PASSWORD - STEP 1 (EMAIL CONFIRMATION) */}
            {/* ============================================================ */}
            {authMode === "forgot_email" && (
              <div className="w-full">
                <div className="mb-6 max-w-sm">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D63C1E]/10 text-[#D63C1E] text-xs font-bold mb-2">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Step 1 of 3: Email Confirmation</span>
                  </div>
                  <h1 className="text-xl font-bold text-[#1A1A1A] mb-1 tracking-tight">
                    Reset Your Passcode
                  </h1>
                  <p className="text-xs text-[#757575] leading-relaxed font-normal">
                    Enter your registered administrator email address to receive an official 6-digit verification code.
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="w-full text-left flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="resetEmail"
                      className="text-[11px] text-[#565F6D] font-bold uppercase tracking-wider pl-4"
                    >
                      Registered Operator Email
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 flex items-center pointer-events-none text-[#757575]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="resetEmail"
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="admin@myshop.ph"
                        className="w-full h-12 rounded-full pl-11 pr-5 bg-[#F3F3F3] text-[#1A1A1A] text-sm placeholder:text-[#757575]/60 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#D63C1E]/10 focus:border-[#D63C1E] shadow-sm transition-all duration-200 border border-[#EAEAEA]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      disabled={isLoading}
                      type="submit"
                      className="w-full h-12 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-sm font-semibold shadow-[0_10px_24px_rgba(214,60,30,0.25)] hover:shadow-[0_12px_28px_rgba(214,60,30,0.32)] transition-all duration-200 flex items-center justify-center cursor-pointer disabled:opacity-85 active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Verification Code...</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span>Send 6-Digit Code</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="text-xs font-semibold text-[#757575] hover:text-[#1A1A1A] text-center pt-2 transition-colors cursor-pointer"
                  >
                    Cancel and Return to Sign In
                  </button>
                </form>
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW 3: FORGOT PASSWORD - STEP 2 (6-DIGIT OTP BOX) */}
            {/* ============================================================ */}
            {authMode === "forgot_otp" && (
              <div className="w-full">
                <div className="mb-6 max-w-sm">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D63C1E]/10 text-[#D63C1E] text-xs font-bold mb-2">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Step 2 of 3: Security Verification</span>
                  </div>
                  <h1 className="text-xl font-bold text-[#1A1A1A] mb-1 tracking-tight">
                    Enter 6-Digit Code
                  </h1>
                  <p className="text-xs text-[#757575] leading-relaxed font-normal">
                    We dispatched a verification code to{" "}
                    <span className="font-semibold text-[#1A1A1A]">{resetEmail || "your email"}</span>.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-5">
                  {/* 6 Digit Input Boxes */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="w-12 h-13 sm:w-13 sm:h-14 text-center text-xl font-extrabold rounded-2xl bg-[#F3F3F3] text-[#1A1A1A] border border-[#EAEAEA] focus:bg-white focus:border-[#D63C1E] focus:ring-4 focus:ring-[#D63C1E]/10 shadow-sm outline-none transition-all duration-150"
                      />
                    ))}
                  </div>

                  {/* Resend Action & Timer */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-[#757575]">Didn&apos;t receive code?</span>
                    {resendCountdown > 0 ? (
                      <span className="text-[#757575] font-medium flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 animate-spin text-[#D63C1E]" />
                        <span>Resend in {resendCountdown}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isResending}
                        className="font-bold text-[#D63C1E] hover:text-[#B22204] transition-colors cursor-pointer"
                      >
                        {isResending ? "Dispatching..." : "Resend Code"}
                      </button>
                    )}
                  </div>

                  {/* Verify Action Button */}
                  <div className="pt-2">
                    <button
                      disabled={isLoading}
                      type="submit"
                      className="w-full h-12 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-sm font-semibold shadow-[0_10px_24px_rgba(214,60,30,0.25)] hover:shadow-[0_12px_28px_rgba(214,60,30,0.32)] transition-all duration-200 flex items-center justify-center cursor-pointer disabled:opacity-85 active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying Security Code...</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span>Verify &amp; Continue</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot_email")}
                      className="text-xs text-[#757575] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                    >
                      Change Email
                    </button>
                    <span className="text-[#E2E2E2]">•</span>
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="text-xs font-semibold text-[#757575] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW 4: FORGOT PASSWORD - STEP 3 (RESET PASSWORD) */}
            {/* ============================================================ */}
            {authMode === "forgot_reset" && (
              <div className="w-full">
                <div className="mb-6 max-w-sm">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A651]/10 text-[#00A651] text-xs font-bold mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Step 3 of 3: New Passcode</span>
                  </div>
                  <h1 className="text-xl font-bold text-[#1A1A1A] mb-1 tracking-tight">
                    Set New Password
                  </h1>
                  <p className="text-xs text-[#757575] leading-relaxed font-normal">
                    Create a strong, confidential password for your operator account.
                  </p>
                </div>

                <form onSubmit={handleResetSubmit} className="w-full text-left flex flex-col gap-4">
                  {/* New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="newPassword"
                      className="text-[11px] text-[#565F6D] font-bold uppercase tracking-wider pl-4"
                    >
                      New Passcode
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 flex items-center pointer-events-none text-[#757575]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full h-12 rounded-full pl-11 pr-11 bg-[#F3F3F3] text-[#1A1A1A] text-sm placeholder:text-[#757575]/60 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#D63C1E]/10 focus:border-[#D63C1E] shadow-sm transition-all duration-200 border border-[#EAEAEA]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 text-[#757575] hover:text-[#1A1A1A] transition-colors focus:outline-none cursor-pointer p-1"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="text-[11px] text-[#565F6D] font-bold uppercase tracking-wider pl-4"
                    >
                      Confirm New Passcode
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 flex items-center pointer-events-none text-[#757575]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full h-12 rounded-full pl-11 pr-11 bg-[#F3F3F3] text-[#1A1A1A] text-sm placeholder:text-[#757575]/60 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#D63C1E]/10 focus:border-[#D63C1E] shadow-sm transition-all duration-200 border border-[#EAEAEA]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 text-[#757575] hover:text-[#1A1A1A] transition-colors focus:outline-none cursor-pointer p-1"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Requirements Hint */}
                  <div className="p-3 rounded-2xl bg-[#F5F5F5] border border-[#EAEAEA] text-[11px] text-[#757575] space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Check className={`w-3.5 h-3.5 ${newPassword.length >= 8 ? "text-[#00A651]" : "text-[#757575]"}`} />
                      <span>Minimum 8 characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className={`w-3.5 h-3.5 ${newPassword && newPassword === confirmPassword ? "text-[#00A651]" : "text-[#757575]"}`} />
                      <span>Passwords match perfectly</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      disabled={isLoading}
                      type="submit"
                      className="w-full h-12 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-sm font-semibold shadow-[0_10px_24px_rgba(214,60,30,0.25)] hover:shadow-[0_12px_28px_rgba(214,60,30,0.32)] transition-all duration-200 flex items-center justify-center cursor-pointer disabled:opacity-85 active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating Passcode...</span>
                        </span>
                      ) : (
                        <span>Update Passcode &amp; Sign In</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW 5: FORGOT PASSWORD - SUCCESS CONFIRMATION */}
            {/* ============================================================ */}
            {authMode === "forgot_success" && (
              <div className="w-full flex flex-col items-center text-center py-2">
                <div className="w-16 h-16 rounded-full bg-[#00A651]/15 text-[#00A651] flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <h1 className="text-xl font-bold text-[#1A1A1A] mb-1.5 tracking-tight">
                  Password Updated!
                </h1>

                <p className="text-xs text-[#757575] leading-relaxed max-w-xs mb-6">
                  Your administrator passcode has been securely reset. You can now access your control tower terminal.
                </p>

                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="w-full h-12 rounded-full bg-[#D63C1E] hover:bg-[#B22204] text-white text-sm font-semibold shadow-[0_10px_24px_rgba(214,60,30,0.25)] transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-[0.98]"
                >
                  Continue to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Minimalist Footer */}
      <footer className="w-full text-center text-[11px] text-[#757575] py-2 z-10">
        &copy; 2026 MyShop Platform Governance &bull; Control Tower Terminal
      </footer>
    </div>
  );
}
