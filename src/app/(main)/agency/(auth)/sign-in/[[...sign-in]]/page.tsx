"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSignIn } from "@clerk/nextjs";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { setJwtAuth, setClerkAuth } from "@/lib/auth-utils";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, isLoaded: clerkLoaded } = useSignIn();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);

      try {
        // JWT Authentication for API/Postman testing
        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Sign in failed");
        }

        // Store JWT token using auth utility
        if (data.token) {
          setJwtAuth(data.token);
          // Redirect to dashboard or home
          window.location.href = "/agency";
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign in failed");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleGoogleSignIn = async () => {
    if (!clerkLoaded || !signIn) return;

    try {
      // Set auth method to Clerk for OAuth
      setClerkAuth();
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: "/agency",
      });
    } catch (err: unknown) {
      console.error("Google sign in error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { errors?: { message: string }[] })?.errors?.[0]?.message ||
            "Google sign in failed";
      setError(errorMessage);
    }
  };

  const handleAppleSignIn = async () => {
    if (!clerkLoaded || !signIn) return;

    try {
      // Set auth method to Clerk for OAuth
      setClerkAuth();
      await signIn.authenticateWithRedirect({
        strategy: "oauth_apple",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: "/agency",
      });
    } catch (err: unknown) {
      console.error("Apple sign in error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { errors?: { message: string }[] })?.errors?.[0]?.message ||
            "Apple sign in failed";
      setError(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.35)] px-8 py-8">
        {/* Logo - left aligned with custom crop box */}
        <div className="mb-6">
          <div className="relative h-16 w-48 overflow-hidden">
            <Image
              src="/pixora_green.svg"
              alt="Pixora logo"
              fill
              sizes="200px"
              className="object-contain object-left h-full w-full"
              priority
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-gray-400 text-sm">
            Please enter your details to sign in
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-3">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-800 mb-1"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className={`w-full pl-9 pr-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-0 focus:border-emerald-600 transition-colors ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-[10px] mt-1">
                {formik.errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-gray-800 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`w-full pl-9 pr-9 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-0 focus:border-emerald-600 transition-colors ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-[10px] mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="h-3.5 w-3.5 rounded border border-gray-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <label
                htmlFor="remember"
                className="text-xs text-gray-600 cursor-pointer select-none"
              >
                Remember me
              </label>
            </div>
            <Link
              href="/agency/forgot-password"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formik.isValid}
            className="w-full py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed text-white mt-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="h-3.5 w-3.5" />
                Login
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-gray-500 text-xs font-medium">
              Login With
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="flex justify-center gap-3">
          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={handleAppleSignIn}
            className="w-10 h-10 flex items-center justify-center bg-[#1a1a2e] rounded-lg hover:bg-[#0f0f1a] transition-all"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Register Link */}
      <p className="text-center mt-5 text-gray-400 text-xs">
        Don&apos;t have an account?{" "}
        <Link
          href="/agency/sign-up"
          className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          Register here
        </Link>
      </p>
    </div>
  );
};

export default SignInPage;
