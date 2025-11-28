"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSignUp } from "@clerk/nextjs";
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .required("Full name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  acceptTerms: Yup.boolean()
    .oneOf([true], "You must accept the terms and conditions")
    .required("You must accept the terms and conditions"),
});

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { signUp, isLoaded: clerkLoaded } = useSignUp();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        // JWT Authentication for API/Postman testing
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Sign up failed");
        }

        setSuccess("Account created successfully! Redirecting to sign in...");

        // Store JWT token if returned
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }

        // Redirect to sign in after success
        setTimeout(() => {
          window.location.href = "/agency/sign-in";
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign up failed");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleGoogleSignUp = async () => {
    if (!clerkLoaded || !signUp) return;

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: "/agency",
      });
    } catch (err: unknown) {
      console.error("Google sign up error:", err);
      const errorMessage = err instanceof Error ? err.message : 
        (err as { errors?: { message: string }[] })?.errors?.[0]?.message || "Google sign up failed";
      setError(errorMessage);
    }
  };

  const handleAppleSignUp = async () => {
    if (!clerkLoaded || !signUp) return;

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_apple",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: "/agency",
      });
    } catch (err: unknown) {
      console.error("Apple sign up error:", err);
      const errorMessage = err instanceof Error ? err.message : 
        (err as { errors?: { message: string }[] })?.errors?.[0]?.message || "Apple sign up failed";
      setError(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.35)] px-8 py-8">
        {/* Logo - left aligned, same as sign-in */}
        <div className="mb-6">
          <div className="relative h-16 w-48 overflow-hidden">
            <Image
              src="/pixora.png"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">SignUp</h1>
          <p className="text-gray-400 text-sm">
            Please enter your details to sign up
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs mb-4">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-lg text-xs mb-4">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-3">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-gray-800 mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                className={`w-full pl-9 pr-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-0 focus:border-[#2657C1] transition-colors ${
                  formik.touched.name && formik.errors.name
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-[10px] mt-1">
                {formik.errors.name}
              </p>
            )}
          </div>

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
                className={`w-full pl-9 pr-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-0 focus:border-[#2657C1] transition-colors ${
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
                placeholder="Create a password"
                className={`w-full pl-9 pr-9 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-0 focus:border-[#2657C1] transition-colors ${
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
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-[10px] mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-gray-800 mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className={`w-full pl-9 pr-9 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-0 focus:border-[#2657C1] transition-colors ${
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="text-red-500 text-[10px] mt-1">
                  {formik.errors.confirmPassword}
                </p>
              )}
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-1.5">
            <Checkbox
              id="acceptTerms"
              checked={formik.values.acceptTerms}
              onCheckedChange={(checked) =>
                formik.setFieldValue("acceptTerms", checked)
              }
              className="mt-0.5 h-3.5 w-3.5 rounded border border-gray-300 data-[state=checked]:bg-[#2657C1] data-[state=checked]:border-[#2657C1]"
            />
            <label
              htmlFor="acceptTerms"
              className="text-xs text-gray-600 cursor-pointer leading-tight"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-[#2657C1] hover:text-[#1e4a9e]"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-[#2657C1] hover:text-[#1e4a9e]"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {formik.touched.acceptTerms && formik.errors.acceptTerms && (
            <p className="text-red-500 text-[10px] mt-1">
              {formik.errors.acceptTerms}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formik.isValid}
            className="w-full py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed text-white mt-1"
            style={{ backgroundColor: "#2657C1" }}
            onMouseEnter={(e) => {
              if (!isLoading && formik.isValid) {
                e.currentTarget.style.backgroundColor = "#1e4a9e";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2657C1";
            }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                SignUp
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
              SignUp With
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="flex justify-center gap-3">
          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
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
            onClick={handleAppleSignUp}
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

      {/* Login Link */}
      <p className="text-center mt-5 text-gray-400 text-xs">
        Already an account?{" "}
        <Link
          href="/agency/sign-in"
          className="text-[#2657C1] hover:text-[#1e4a9e] font-medium transition-colors"
        >
          Login here
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;
