import { EditorElement, DeviceTypes } from "@/lib/types/editor";
import { TOKENS } from "./tokens";
import { r, section, container, text, link, icon } from "./utils";

export const createSaasNavbar = (
    device: DeviceTypes = "Desktop"
): EditorElement =>
    section(
        "Modern Navbar",
        {
            background: TOKENS.glass,
            backdropFilter: TOKENS.backdrop,
            WebkitBackdropFilter: TOKENS.backdrop,
            borderBottom: TOKENS.border,
            boxShadow: TOKENS.shadowSoft,
        },
        "sticky top-0 z-[100] w-full flex justify-center items-center px-4 py-3 md:px-8 md:py-4",
        [
            container(
                "Nav Container",
                {},
                "w-full max-w-7xl flex flex-col gap-3 md:gap-4",
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
                                            color: TOKENS.accent,
                                            fontWeight: "700",
                                        },
                                        "text-xl md:text-2xl",
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
                                        "text-lg md:text-2xl leading-none",
                                        "Pixora"
                                    ),
                                ]
                            ),
                            container(
                                "Desktop Navigation Links",
                                {
                                    background: "rgba(15, 23, 42, 0.04)",
                                    border: "1px solid rgba(148, 163, 184, 0.16)",
                                },
                                "hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-full",
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
                                        "text-sm px-4 py-2 rounded-full hover:bg-black/5",
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
                                        "text-sm px-4 py-2 rounded-full hover:bg-black/5",
                                        "#pricing",
                                        "Pricing"
                                    ),
                                ]
                            ),
                            container(
                                "Nav Actions",
                                {},
                                "hidden md:flex items-center gap-2.5",
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
                                            boxShadow: TOKENS.shadowCard,
                                        },
                                        "text-sm px-6 py-2.5 rounded-full whitespace-nowrap",
                                        "/sign-up",
                                        "Get Started"
                                    ),
                                ]
                            ),
                            container(
                                "Mobile Menu Trigger",
                                {
                                    background: "#ffffff",
                                    border: TOKENS.border,
                                    boxShadow: TOKENS.shadowSoft,
                                },
                                "flex md:hidden items-center justify-center px-3 py-2 rounded-xl",
                                [
                                    text(
                                        "Menu Label",
                                        {
                                            fontSize: "12px",
                                            fontWeight: "700",
                                            letterSpacing: "0.04em",
                                            color: TOKENS.text,
                                            textTransform: "uppercase",
                                        },
                                        "",
                                        "Menu"
                                    ),
                                ]
                            ),
                        ]
                    ),
                    container(
                        "Mobile Navigation Panel",
                        {
                            background: "rgba(248, 250, 252, 0.92)",
                            border: TOKENS.border,
                            boxShadow: TOKENS.shadowSoft,
                            borderRadius: TOKENS.radiusLg,
                            padding: r(device, "12px", "12px", "14px"),
                        },
                        "flex md:hidden flex-col gap-2 w-full",
                        [
                            link(
                                "Home Mobile",
                                {
                                    color: TOKENS.text,
                                    textDecoration: "none",
                                    fontWeight: "600",
                                    background: "#ffffff",
                                    border: TOKENS.border,
                                },
                                "text-sm px-4 py-3 rounded-xl text-center",
                                "/",
                                "Home"
                            ),
                            link(
                                "Features Mobile",
                                {
                                    color: TOKENS.text,
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    background: "rgba(255, 255, 255, 0.78)",
                                    border: TOKENS.border,
                                },
                                "text-sm px-4 py-3 rounded-xl text-center",
                                "#features",
                                "Features"
                            ),
                            link(
                                "Pricing Mobile",
                                {
                                    color: TOKENS.text,
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    background: "rgba(255, 255, 255, 0.78)",
                                    border: TOKENS.border,
                                },
                                "text-sm px-4 py-3 rounded-xl text-center",
                                "#pricing",
                                "Pricing"
                            ),
                            container(
                                "Mobile CTA Row",
                                {},
                                "grid grid-cols-2 gap-2 w-full mt-1",
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
                                        "Log in"
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
                                        "Get Started"
                                    ),
                                ]
                            ),
                        ]
                    ),
                ]
            ),
        ]
    );
