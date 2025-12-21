import { EditorElement, DeviceTypes } from "@/lib/types/editor";
import { TOKENS } from "./tokens";
import { r, section, container, text, link, icon } from "./utils";

export const createSaasNavbar = (
    device: DeviceTypes = "Desktop"
): EditorElement =>
    section(
        "Modern Navbar",
        {
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
            boxShadow: TOKENS.shadowSoft,
        },
        "sticky top-0 z-[100] w-full flex justify-center items-center px-5 py-4 md:px-8 md:py-5",
        [
            container(
                "Nav Container",
                {},
                "w-full max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4",
                [
                    // Brand Container
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
                                    color: TOKENS.accent,
                                    fontWeight: "600",
                                    filter: "drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))",
                                },
                                "text-2xl",
                                "◆"
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
                                "text-xl md:text-2xl leading-none",
                                "Pixora"
                            ),
                        ]
                    ),

                    // Desktop Navigation Links (Hidden on mobile)
                    container(
                        "Desktop Nav Links",
                        {
                            background: "rgba(0,0,0,0.03)",
                            border: "1px solid rgba(0,0,0,0.02)",
                        },
                        "hidden md:flex items-center gap-3 px-1.5 py-1.5 rounded-full",
                        [
                            link(
                                "Home",
                                {
                                    color: TOKENS.text,
                                    textDecoration: "none",
                                    fontWeight: "600",
                                    transition: TOKENS.transition,
                                    background: "#ffffff",
                                    boxShadow: "0 2px 8px -2px rgba(0,0,0,0.1)",
                                },
                                "text-sm px-5 py-2 rounded-full",
                                "/",
                                "Home"
                            ),
                            link(
                                "Features",
                                {
                                    color: TOKENS.muted,
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    transition: TOKENS.transition,
                                },
                                "text-sm px-5 py-2 rounded-full hover:bg-black/5",
                                "#features",
                                "Features"
                            ),
                            link(
                                "Pricing",
                                {
                                    color: TOKENS.muted,
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    transition: TOKENS.transition,
                                },
                                "text-sm px-5 py-2 rounded-full hover:bg-black/5",
                                "#pricing",
                                "Pricing"
                            ),
                        ]
                    ),

                    // Mobile Navigation Links (Shown on mobile only)
                    container(
                        "Mobile Nav Links",
                        {
                            background: "rgba(248, 248, 248, 0.95)",
                            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                        },
                        "flex md:hidden flex-col gap-3 w-full p-5",
                        [
                            link(
                                "Home Mobile",
                                {
                                    color: "#ffffff",
                                    textDecoration: "none",
                                    fontWeight: "600",
                                    background: TOKENS.accent,
                                    transition: TOKENS.transition,
                                    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)",
                                },
                                "text-sm px-5 py-3.5 rounded-lg text-center",
                                "/",
                                "Home"
                            ),
                            link(
                                "Features Mobile",
                                {
                                    color: TOKENS.text,
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    background: "rgba(0, 0, 0, 0.04)",
                                    transition: TOKENS.transition,
                                },
                                "text-sm px-5 py-3.5 rounded-lg text-center",
                                "#features",
                                "Features"
                            ),
                            link(
                                "Pricing Mobile",
                                {
                                    color: TOKENS.text,
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    background: "rgba(0, 0, 0, 0.04)",
                                    transition: TOKENS.transition,
                                },
                                "text-sm px-5 py-3.5 rounded-lg text-center",
                                "#pricing",
                                "Pricing"
                            ),
                            link(
                                "Login Mobile",
                                {
                                    color: TOKENS.accent,
                                    textDecoration: "none",
                                    fontWeight: "600",
                                    background: "rgba(99, 102, 241, 0.08)",
                                    border: "1.5px solid rgba(99, 102, 241, 0.25)",
                                    transition: TOKENS.transition,
                                },
                                "text-sm px-5 py-3.5 rounded-lg text-center",
                                "/sign-in",
                                "Log in"
                            ),
                            link(
                                "Get Started Mobile",
                                {
                                    color: "#ffffff",
                                    textDecoration: "none",
                                    fontWeight: "600",
                                    background: TOKENS.accent,
                                    transition: TOKENS.transition,
                                    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
                                },
                                "text-sm px-5 py-4 rounded-lg text-center",
                                "/sign-up",
                                "Get Started"
                            ),
                        ]
                    ),

                    // Action Buttons (Desktop)
                    container(
                        "Nav Actions",
                        {},
                        "hidden md:flex items-center gap-3",
                        [
                            link(
                                "Login",
                                {
                                    color: TOKENS.accent,
                                    textDecoration: "none",
                                    fontWeight: "600",
                                    transition: TOKENS.transition,
                                    background: "rgba(99, 102, 241, 0.1)",
                                    border: "1px solid rgba(99, 102, 241, 0.3)",
                                },
                                "text-sm px-5 py-2.5 rounded-full whitespace-nowrap",
                                "/sign-in",
                                "Log in"
                            ),
                            link(
                                "Get Started",
                                {
                                    background: TOKENS.accent,
                                    color: "#ffffff",
                                    textDecoration: "none",
                                    fontWeight: "600",
                                    transition: TOKENS.transition,
                                    boxShadow: "0 4px 12px -2px rgba(99, 102, 241, 0.5)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                },
                                "text-sm px-7 py-3 rounded-full whitespace-nowrap",
                                "/sign-up",
                                "Get Started"
                            ),
                        ]
                    ),
                ]
            ),
        ]
    );
