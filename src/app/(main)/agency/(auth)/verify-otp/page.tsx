"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push("/agency/forgot-password");
    }
  }, [email, router]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      // Redirect to reset password page with the token
      router.push(`/agency/reset-password?token=${data.resetToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendDisabled || !email) return;

    setResendDisabled(true);
    setCountdown(60);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend OTP");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  if (!email) {
    return null;
  }

  return (
    <div className="w-full max-w-[360px]">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.35)] px-8 py-8">
        {/* Logo */}
        <div className="mb-6">
          <div className="relative h-16 w-48 overflow-hidden">
            <Image
              src="/pixora_green.svg"
              alt="Pixora logo"
              fill
              sizes="120px"
              className="object-contain object-left h-full w-full"
              priority
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Verify OTP
          </h1>
          <p className="text-gray-400 text-sm">
            We&apos;ve sent a 6-digit code to{" "}
            <span className="text-gray-600 font-medium">{email}</span>. Enter
            the code below to verify.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs mb-4">
            {error}
          </div>
        )}

        {/* OTP Input */}
        <div className="flex flex-col items-center mb-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot
                index={0}
                className="w-11 h-12 text-xl font-bold text-gray-900 bg-white border-2 border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <InputOTPSlot
                index={1}
                className="w-11 h-12 text-xl font-bold text-gray-900 bg-white border-2 border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <InputOTPSlot
                index={2}
                className="w-11 h-12 text-xl font-bold text-gray-900 bg-white border-2 border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </InputOTPGroup>
            <InputOTPSeparator className="text-gray-400 mx-2" />
            <InputOTPGroup>
              <InputOTPSlot
                index={3}
                className="w-11 h-12 text-xl font-bold text-gray-900 bg-white border-2 border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <InputOTPSlot
                index={4}
                className="w-11 h-12 text-xl font-bold text-gray-900 bg-white border-2 border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <InputOTPSlot
                index={5}
                className="w-11 h-12 text-xl font-bold text-gray-900 bg-white border-2 border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isLoading || otp.length !== 6}
          className="w-full py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed text-white bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Verify OTP</>
          )}
        </button>

        {/* Resend */}
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-xs">
            Didn&apos;t receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={resendDisabled}
              className={`font-medium transition-colors ${
                resendDisabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-emerald-600 hover:text-emerald-700"
              }`}
            >
              {resendDisabled ? `Resend in ${countdown}s` : "Resend OTP"}
            </button>
          </p>
        </div>
      </div>

      {/* Back to login */}
      <p className="text-center mt-5 text-gray-400 text-xs">
        Remember password?{" "}
        <Link
          href="/agency/sign-in"
          className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          Login here
        </Link>
      </p>
    </div>
  );
};

export default VerifyOTPPage;

