import { EditorElement, DeviceTypes } from "@/lib/types/editor";
import { TOKENS } from "./tokens";
import { r, section, container, text, link, icon, genId } from "./utils";

export const createSaasFooter = (
    device: DeviceTypes = "Desktop"
): EditorElement =>
    section(
        "Modern Footer",
        {
            padding: r(device, "60px 20px 30px", "80px 40px 40px", "100px 48px 50px"),
            background: TOKENS.darkBg,
            backgroundImage: `radial-gradient(circle at 50% 0%, ${TOKENS.accentLight} 0%, transparent 50%)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: TOKENS.darkText,
            overflow: "hidden",
            position: "relative",
        },
        "",
        [
            container(
                "Content",
                {
                    width: "100%",
                    maxWidth: "1400px",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    gap: r(device, "40px", "50px", "60px"),
                    marginBottom: r(device, "40px", "60px", "80px"),
                    zIndex: "1",
                },
                "",
                [
                    container(
                        "Brand Side",
                        {
                            flex: r(device, "1 1 100%", "1 1 280px", "1 1 320px"),
                            maxWidth: "400px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "24px",
                        },
                        "",
                        [
                            container(
                                "Brand Container",
                                {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                },
                                "",
                                [
                                    icon(
                                        "Footer Logo Icon",
                                        {
                                            fontSize: "28px",
                                            color: TOKENS.accent,
                                            fontWeight: "600",
                                            filter: "drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))",
                                        },
                                        "",
                                        "◆"
                                    ),
                                    text(
                                        "Logo",
                                        {
                                            fontSize: r(device, "24px", "26px", "28px"),
                                            fontWeight: "800",
                                            color: "#ffffff",
                                            letterSpacing: "-1px",
                                        },
                                        "",
                                        "Pixora"
                                    ),
                                ]
                            ),
                            text(
                                "Desc",
                                {
                                    fontSize: r(device, "15px", "16px", "16px"),
                                    color: TOKENS.darkMuted,
                                    lineHeight: "1.7",
                                    maxWidth: "320px",
                                },
                                "",
                                "Building the future of digital experiences. Simple, clean, and powerful."
                            ),

                            // Social Icons
                            container(
                                "Socials",
                                {
                                    display: "flex",
                                    gap: "12px",
                                    alignItems: "center",
                                    marginTop: "8px",
                                },
                                "",
                                [
                                    ...[
                                        { name: "Twitter", emoji: "𝕏" },
                                        { name: "Instagram", emoji: "📷" },
                                        { name: "LinkedIn", emoji: "in" },
                                        { name: "Github", emoji: "⚡" }
                                    ].map(social =>
                                        link(
                                            social.name,
                                            {
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: "44px",
                                                height: "44px",
                                                borderRadius: "50%",
                                                background: "rgba(255, 255, 255, 0.03)",
                                                color: TOKENS.darkMuted,
                                                textDecoration: "none",
                                                fontSize: "18px",
                                                transition: TOKENS.transition,
                                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                                                cursor: "pointer",
                                            },
                                            "",
                                            "#",
                                            social.emoji
                                        )
                                    )
                                ]
                            ),
                        ]
                    ),

                    ...[
                        {
                            title: "Product",
                            links: ["Features", "Pricing", "Updates", "Documentation"],
                        },
                        {
                            title: "Company",
                            links: ["About", "Blog", "Careers", "Contact"],
                        },
                        {
                            title: "Resources",
                            links: ["Help Center", "Community", "Tutorials", "API"],
                        },
                    ].map((col) =>
                        container(
                            `Col ${col.title}`,
                            {
                                flex: r(
                                    device,
                                    "1 1 calc(50% - 20px)",
                                    "1 1 140px",
                                    "1 1 160px"
                                ),
                                minWidth: r(device, "140px", "140px", "160px"),
                                display: "flex",
                                flexDirection: "column",
                                gap: "20px",
                            },
                            "",
                            [
                                text(
                                    "Head",
                                    {
                                        fontSize: r(device, "13px", "14px", "14px"),
                                        fontWeight: "700",
                                        color: "#ffffff",
                                        textTransform: "uppercase",
                                        letterSpacing: "1.2px",
                                    },
                                    "",
                                    col.title
                                ),
                                ...col.links.map((linkText, idx) =>
                                    link(
                                        `${col.title} Link ${idx}`,
                                        {
                                            fontSize: r(device, "14px", "14px", "15px"),
                                            color: TOKENS.darkMuted,
                                            textDecoration: "none",
                                            lineHeight: "2.2",
                                            transition: TOKENS.transition,
                                            display: "block",
                                        },
                                        "",
                                        "#",
                                        linkText
                                    )
                                ),
                            ]
                        )
                    ),
                ]
            ),
            container(
                "Copyright",
                {
                    borderTop: `1px solid ${TOKENS.darkBorder}`,
                    width: "100%",
                    maxWidth: "1400px",
                    paddingTop: r(device, "24px", "28px", "32px"),
                    textAlign: "center",
                    display: "flex",
                    flexDirection: r(device, "column", "row", "row"),
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    zIndex: "1",
                },
                "",
                [
                    text(
                        "Copy",
                        {
                            fontSize: r(device, "13px", "14px", "14px"),
                            color: TOKENS.muted,
                        },
                        "",
                        "© 2024 Pixora Inc. All rights reserved."
                    ),
                    container(
                        "Footer Links",
                        {
                            display: "flex",
                            gap: r(device, "16px", "20px", "24px"),
                            flexWrap: "wrap",
                            justifyContent: "center",
                        },
                        "",
                        [
                            link(
                                "Privacy",
                                {
                                    fontSize: r(device, "13px", "14px", "14px"),
                                    color: TOKENS.muted,
                                    textDecoration: "none",
                                    transition: TOKENS.transition,
                                },
                                "",
                                "#privacy",
                                "Privacy"
                            ),
                            link(
                                "Terms",
                                {
                                    fontSize: r(device, "13px", "14px", "14px"),
                                    color: TOKENS.muted,
                                    textDecoration: "none",
                                    transition: TOKENS.transition,
                                },
                                "",
                                "#terms",
                                "Terms"
                            ),
                            link(
                                "Cookies",
                                {
                                    fontSize: r(device, "13px", "14px", "14px"),
                                    color: TOKENS.muted,
                                    textDecoration: "none",
                                    transition: TOKENS.transition,
                                },
                                "",
                                "#cookies",
                                "Cookies"
                            ),
                        ]
                    ),
                ]
            ),
        ]
    );
