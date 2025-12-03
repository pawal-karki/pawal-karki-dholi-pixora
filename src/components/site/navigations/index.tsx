"use client";

import React, { useEffect, useState } from "react";
import { User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { ModeToggle } from "@/components/global/mode-toggle";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { clearAllAuth } from "@/lib/auth-utils";

type Props = {
  user?: null | User;
};

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

// Generate DiceBear avatar URL
const getDiceBearAvatar = (seed: string, style: string = "avataaars") => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=10b981,14b8a6,06b6d4&backgroundType=gradientLinear`;
};

// Decode JWT token to get user info
const decodeJwtPayload = (
  token: string
): { email?: string; name?: string; sub?: string } | null => {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

const Navigation = ({ user }: Props) => {
  const { resolvedTheme } = useTheme();
  const { isSignedIn: isClerkSignedIn } = useUser();
  const { signOut } = useClerk();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isJwtSignedIn, setIsJwtSignedIn] = useState(false);
  const [jwtUserSeed, setJwtUserSeed] = useState<string>("user");

  useEffect(() => {
    setMounted(true);

    // Check for JWT token and extract user info
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsJwtSignedIn(true);
      const payload = decodeJwtPayload(token);
      if (payload) {
        // Use email, name, or sub as seed for avatar
        const seed = payload.email || payload.name || payload.sub || "user";
        setJwtUserSeed(seed);
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // User is signed in if either Clerk or JWT auth
  const isSignedIn = isClerkSignedIn || isJwtSignedIn;

  // Handle logout for both Clerk and JWT
  const handleLogout = async () => {
    // Clear JWT auth
    clearAllAuth();
    setIsJwtSignedIn(false);

    // Sign out from Clerk if signed in via Clerk
    if (isClerkSignedIn) {
      await signOut();
    }

    // Redirect to home
    window.location.href = "/";
  };

  // Determine logo based on theme (default to green for SSR)
  const logoSrc =
    mounted && resolvedTheme === "dark"
      ? "/pixora_dark_mode.svg"
      : "/pixora_green.svg";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-[140px] h-[50px] md:w-[160px] md:h-[60px] overflow-hidden">
              <Image
                src={logoSrc}
                alt="Pixora logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 group"
              >
                {link.label}
                {/* Animated underline */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-[60%]" />
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              /* Dashboard & Logout buttons - shown when signed in */
              <>
                <Link
                  href="/agency"
                  className="hidden md:inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login button - Desktop */}
                <Link
                  href="/agency/sign-in"
                  className="hidden md:inline-flex items-center justify-center px-5 py-2 text-sm font-medium rounded-full border border-border/50 bg-background/50 hover:bg-accent hover:border-primary/30 text-foreground transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                >
                  Sign In
                </Link>

                {/* Get Started button */}
                <Link
                  href="/agency/sign-up"
                  className="hidden md:inline-flex items-center justify-center px-5 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* User Avatar - Clerk UserButton or DiceBear Avatar for JWT */}
            {isSignedIn &&
              (isClerkSignedIn ? (
                <UserButton />
              ) : (
                /* DiceBear Animated Avatar for JWT Users */
                <div className="animated-avatar" title={jwtUserSeed}>
                  <div className="avatar-inner overflow-hidden">
                    <Image
                      src={getDiceBearAvatar(jwtUserSeed, "avataaars")}
                      alt="User avatar"
                      width={36}
                      height={36}
                      className="rounded-full"
                      unoptimized
                    />
                  </div>
                </div>
              ))}
            <ModeToggle />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-[400px] pb-4" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-3 px-4">
              {isSignedIn ? (
                <>
                  <Link
                    href="/agency"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/agency/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-medium rounded-lg border border-border/50 bg-background/50 hover:bg-accent transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/agency/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
