"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        // Call API to start forgot-password flow (implement separately)
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Unable to process request");
        }

        setSuccess(
          "If this email exists, we have sent a password reset link to your inbox."
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to process password reset request"
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="w-full max-w-[360px]">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.35)] px-8 py-8">
        {/* Logo - left aligned, same style as other auth pages */}
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
            Forgot Password?
          </h1>
          <p className="text-gray-400 text-sm">
            Don&apos;t worry it happens. Please enter the email address and we
            will send the OTP to this email address.
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
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-800 mb-1"
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-0 focus:border-emerald-600 transition-colors ${
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formik.isValid}
            className="w-full py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed text-white mt-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Continue</>
            )}
          </button>
        </form>
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

export default ForgotPasswordPage;
