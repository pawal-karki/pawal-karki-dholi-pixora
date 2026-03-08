import { EditorElement, DeviceTypes } from "@/lib/types/editor";
import { TOKENS } from "./tokens";
import { r, section, container, text, link, icon } from "./utils";

export const createSaasNavbar = (
  device: DeviceTypes = "Desktop",
): EditorElement =>
  section(
    "Modern Navbar",
    {
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(248,250,252,0.82) 100%)",
      backdropFilter: "blur(16px) saturate(160%)",
      WebkitBackdropFilter: "blur(16px) saturate(160%)",
      borderBottom: "1px solid rgba(148,163,184,0.22)",
      boxShadow: "0 8px 28px -18px rgba(15,23,42,0.45)",
    },
    "sticky top-0 z-[100] w-full flex justify-center items-center px-4 py-3 @md:px-8 @md:py-4",
    [
      container(
        "Nav Container",
        {},
        "w-full max-w-7xl flex flex-col gap-3 @md:gap-3",
        [
          container(
            "Top Nav Row",
            {},
            "w-full flex items-center justify-between gap-3",
            [
              container(
                "Brand Container",
                {
                  cursor: "pointer",
                },
                "flex items-center gap-2.5",
                [
                  icon(
                    "Brand Icon",
                    {
                      color: TOKENS.accentHover,
                      fontWeight: "700",
                      background: "rgba(79,70,229,0.08)",
                      border: "1px solid rgba(79,70,229,0.2)",
                      borderRadius: "10px",
                      width: "28px",
                      height: "28px",
                    },
                    "text-sm @md:text-base",
                    "◆",
                  ),
                  text(
                    "Brand Logo",
                    {
                      fontWeight: "800",
                      color: TOKENS.text,
                      letterSpacing: "-0.5px",
                      background: TOKENS.textGradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    },
                    "text-lg @md:text-2xl leading-none",
                    "Pixora",
                  ),
                ],
              ),
              container(
                "Desktop Navigation Links",
                {
                  background: "rgba(15, 23, 42, 0.04)",
                  border: "1px solid rgba(148, 163, 184, 0.16)",
                },
                "nav-desktop-only hidden flex items-center gap-1 px-1.5 py-1 rounded-full",
                [
                  link(
                    "Home",
                    {
                      color: TOKENS.text,
                      textDecoration: "none",
                      fontWeight: "600",
                      transition: TOKENS.transition,
                      background: "#ffffff",
                      boxShadow: TOKENS.shadowSoft,
                    },
                    "text-sm px-4 py-2 rounded-full",
                    "/",
                    "Home",
                  ),
                  link(
                    "Features",
                    {
                      color: TOKENS.muted,
                      textDecoration: "none",
                      fontWeight: "500",
                      transition: TOKENS.transition,
                    },
                    "text-sm px-4 py-2 rounded-full hover:bg-black/5",
                    "#features",
                    "Features",
                  ),
                  link(
                    "Pricing",
                    {
                      color: TOKENS.muted,
                      textDecoration: "none",
                      fontWeight: "500",
                      transition: TOKENS.transition,
                    },
                    "text-sm px-4 py-2 rounded-full hover:bg-black/5",
                    "#pricing",
                    "Pricing",
                  ),
                  link(
                    "About",
                    {
                      color: TOKENS.muted,
                      textDecoration: "none",
                      fontWeight: "500",
                      transition: TOKENS.transition,
                    },
                    "text-sm px-4 py-2 rounded-full hover:bg-black/5",
                    "#about",
                    "About",
                  ),
                ],
              ),
              container(
                "Nav Actions",
                {},
                "nav-desktop-only hidden flex items-center gap-2.5",
                [
                  link(
                    "Login",
                    {
                      color: TOKENS.accent,
                      textDecoration: "none",
                      fontWeight: "600",
                      transition: TOKENS.transition,
                      background: TOKENS.accentLight,
                      border: "1px solid rgba(79, 70, 229, 0.22)",
                    },
                    "text-sm px-4 py-2.5 rounded-full whitespace-nowrap",
                    "/sign-in",
                    "Log in",
                  ),
                  link(
                    "Get Started",
                    {
                      background: TOKENS.accent,
                      color: "#ffffff",
                      textDecoration: "none",
                      fontWeight: "600",
                      transition: TOKENS.transition,
                      boxShadow: "0 8px 20px -10px rgba(79,70,229,0.6)",
                    },
                    "text-sm px-6 py-2.5 rounded-full whitespace-nowrap",
                    "/sign-up",
                    "Get Started",
                  ),
                ],
              ),
              container(
                "Mobile Menu Trigger",
                {
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(148,163,184,0.2)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                },
                "nav-mobile-only flex items-center justify-center w-10 h-10 rounded-lg",
                [
                  icon(
                    "Menu Icon",
                    {
                      color: TOKENS.text,
                      fontWeight: "700",
                      fontSize: "20px",
                    },
                    "text-lg",
                    "≡",
                  ),
                ],
              ),
            ],
          ),
          container(
            "Mobile Navigation Panel",
            {
              background: "rgba(248,250,252,0.95)",
              border: "1px solid rgba(148,163,184,0.24)",
              boxShadow: TOKENS.shadowSoft,
              borderRadius: TOKENS.radiusLg,
              padding: r(device, "12px", "12px", "14px"),
            },
            "nav-mobile-only nav-mobile-panel flex flex-col gap-2 w-full",
            [
              container(
                "Mobile Item Home",
                {
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  transition: "background 0.15s ease",
                },
                "hover:bg-slate-50",
                [
                  icon(
                    "Mobile Home Icon",
                    { color: TOKENS.accent, fontWeight: "700" },
                    "text-sm",
                    "⌂",
                  ),
                  link(
                    "Home Mobile",
                    {
                      color: TOKENS.text,
                      textDecoration: "none",
                      fontWeight: "600",
                    },
                    "text-sm",
                    "/",
                    "Home",
                  ),
                ],
              ),
              container(
                "Mobile Item Features",
                {
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  transition: "background 0.15s ease",
                },
                "hover:bg-slate-50",
                [
                  icon(
                    "Mobile Features Icon",
                    { color: TOKENS.accent, fontWeight: "700" },
                    "text-sm",
                    "◈",
                  ),
                  link(
                    "Features Mobile",
                    {
                      color: TOKENS.text,
                      textDecoration: "none",
                      fontWeight: "500",
                    },
                    "text-sm",
                    "#features",
                    "Features",
                  ),
                ],
              ),
              container(
                "Mobile Item Pricing",
                {
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  transition: "background 0.15s ease",
                },
                "hover:bg-slate-50",
                [
                  icon(
                    "Mobile Pricing Icon",
                    { color: TOKENS.accent, fontWeight: "700" },
                    "text-sm",
                    "$",
                  ),
                  link(
                    "Pricing Mobile",
                    {
                      color: TOKENS.text,
                      textDecoration: "none",
                      fontWeight: "500",
                    },
                    "text-sm",
                    "#pricing",
                    "Pricing",
                  ),
                ],
              ),
              container(
                "Mobile Item About",
                {
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  transition: "background 0.15s ease",
                },
                "hover:bg-slate-50",
                [
                  icon(
                    "Mobile About Icon",
                    { color: TOKENS.accent, fontWeight: "700" },
                    "text-sm",
                    "◉",
                  ),
                  link(
                    "About Mobile",
                    {
                      color: TOKENS.text,
                      textDecoration: "none",
                      fontWeight: "500",
                    },
                    "text-sm",
                    "#about",
                    "About",
                  ),
                ],
              ),
              container(
                "Mobile CTA Row",
                {},
                "grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-slate-100",
                [
                  link(
                    "Login Mobile",
                    {
                      color: TOKENS.accent,
                      textDecoration: "none",
                      fontWeight: "600",
                      background: TOKENS.accentLight,
                      border: "1px solid rgba(79, 70, 229, 0.22)",
                    },
                    "text-sm px-4 py-3 rounded-xl text-center",
                    "/sign-in",
                    "Log in",
                  ),
                  link(
                    "Get Started Mobile",
                    {
                      color: "#ffffff",
                      textDecoration: "none",
                      fontWeight: "600",
                      background: TOKENS.accent,
                      boxShadow: TOKENS.shadowCard,
                    },
                    "text-sm px-4 py-3 rounded-xl text-center",
                    "/sign-up",
                    "Get Started",
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
