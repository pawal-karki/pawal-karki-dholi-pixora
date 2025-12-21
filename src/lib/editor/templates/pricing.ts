import { EditorElement, DeviceTypes } from "@/lib/types/editor";
import { TOKENS } from "./tokens";
import { r, section, container, text, link, icon } from "./utils";

export const createSaasPricing = (
    device: DeviceTypes = "Desktop"
): EditorElement =>
    section(
        "Modern Pricing",
        {
            padding: r(device, "60px 20px", "80px 40px", "100px 48px"),
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        },
        [
            container(
                "Header",
                {
                    textAlign: "center",
                    maxWidth: "700px",
                    marginBottom: r(device, "40px", "50px", "60px"),
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "20px",
                },
                [
                    text(
                        "Badge",
                        {
                            fontSize: r(device, "12px", "13px", "13px"),
                            fontWeight: "600",
                            color: TOKENS.accent,
                            background: TOKENS.accentBg,
                            padding: "6px 14px",
                            borderRadius: "100px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        },
                        "Simple Pricing"
                    ),
                    text(
                        "Title",
                        {
                            fontSize: r(device, "32px", "40px", "48px"),
                            fontWeight: "800",
                            color: TOKENS.text,
                            letterSpacing: "-1px",
                            lineHeight: "1.1",
                        },
                        "Fair price for everyone"
                    ),
                    text(
                        "Subtitle",
                        {
                            fontSize: r(device, "16px", "17px", "18px"),
                            color: TOKENS.muted,
                            lineHeight: "1.7",
                            maxWidth: "600px",
                        },
                        "Start for free and scale as you grow. No credit card required."
                    ),
                ]
            ),

            container(
                "Plans Grid",
                {
                    display: "grid",
                    gridTemplateColumns: r(
                        device,
                        "1fr",
                        "repeat(2, 1fr)",
                        "repeat(3, 1fr)"
                    ),
                    gap: r(device, "24px", "28px", "32px"),
                    width: "100%",
                    maxWidth: "1400px",
                    alignItems: "stretch",
                },
                [
                    ...[
                        {
                            name: "Starter",
                            price: "$0",
                            desc: "Perfect for individuals getting started.",
                            btn: "Get Started",
                            primary: false,
                            badge: null,
                        },
                        {
                            name: "Pro",
                            price: "$29",
                            desc: "Advanced features for professionals.",
                            btn: "Start Free Trial",
                            primary: true,
                            badge: "Most Popular",
                        },
                        {
                            name: "Business",
                            price: "$99",
                            desc: "For scaling teams and enterprises.",
                            btn: "Contact Sales",
                            primary: false,
                            badge: null,
                        },
                    ].map((p, i) =>
                        container(
                            `Plan ${p.name}`,
                            {
                                border: p.primary
                                    ? `2px solid ${TOKENS.accent}`
                                    : "1px solid rgba(0,0,0,0.08)",
                                borderRadius: "24px",
                                padding: r(device, "28px", "32px", "36px"),
                                display: "flex",
                                flexDirection: "column",
                                background: p.primary
                                    ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
                                    : "#ffffff",
                                position: "relative",
                                boxShadow: p.primary
                                    ? TOKENS.shadowFloat
                                    : TOKENS.shadowCard,
                                transition: TOKENS.transition,
                                overflow: "hidden",
                            },
                            [
                                // Badge
                                p.badge
                                    ? container(
                                          "Badge",
                                          {
                                              position: "absolute",
                                              top: "20px",
                                              right: "20px",
                                              background: TOKENS.accent,
                                              color: "#ffffff",
                                              padding: "4px 12px",
                                              borderRadius: "100px",
                                              fontSize: "11px",
                                              fontWeight: "700",
                                              textTransform: "uppercase",
                                              letterSpacing: "0.5px",
                                          },
                                          [text("Badge Text", {}, p.badge)]
                                      )
                                    : container("Spacer", { height: "0px" }, []),

                                // Plan Name
                                text(
                                    "Name",
                                    {
                                        fontSize: r(device, "18px", "20px", "22px"),
                                        fontWeight: "700",
                                        color: TOKENS.text,
                                        marginBottom: "12px",
                                    },
                                    p.name
                                ),

                                // Price Box
                                container(
                                    "Price Box",
                                    {
                                        display: "flex",
                                        alignItems: "baseline",
                                        gap: "6px",
                                        marginBottom: "8px",
                                    },
                                    [
                                        text(
                                            "Price",
                                            {
                                                fontSize: r(device, "40px", "48px", "56px"),
                                                fontWeight: "800",
                                                color: TOKENS.text,
                                                letterSpacing: "-2px",
                                                lineHeight: "1",
                                            },
                                            p.price
                                        ),
                                        text(
                                            "Period",
                                            {
                                                fontSize: r(device, "14px", "15px", "16px"),
                                                color: TOKENS.muted,
                                                fontWeight: "500",
                                            },
                                            "/month"
                                        ),
                                    ]
                                ),

                                // Description
                                text(
                                    "Desc",
                                    {
                                        fontSize: r(device, "14px", "15px", "15px"),
                                        color: TOKENS.muted,
                                        lineHeight: "1.6",
                                        marginBottom: "28px",
                                    },
                                    p.desc
                                ),

                                // CTA Button
                                link(
                                    "CTA",
                                    {
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: r(device, "14px 20px", "15px 24px", "16px 28px"),
                                        textAlign: "center",
                                        borderRadius: "12px",
                                        fontWeight: "600",
                                        fontSize: r(device, "14px", "14px", "15px"),
                                        textDecoration: "none",
                                        background: p.primary
                                            ? TOKENS.accent
                                            : "rgba(0,0,0,0.04)",
                                        color: p.primary ? "#ffffff" : TOKENS.text,
                                        transition: TOKENS.transition,
                                        marginBottom: "32px",
                                        boxShadow: p.primary
                                            ? "0 4px 6px -1px rgba(99, 102, 241, 0.3)"
                                            : "none",
                                    },
                                    "#",
                                    p.btn
                                ),

                                // Features List
                                container(
                                    "List",
                                    {
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: r(device, "14px", "16px", "18px"),
                                        flex: "1",
                                    },
                                    [
                                        "Unlimited Projects",
                                        "Analytics Dashboard",
                                        "24/7 Support",
                                        "Custom Domain",
                                    ].map((f) =>
                                        container(
                                            "Item",
                                            {
                                                display: "flex",
                                                gap: "12px",
                                                alignItems: "flex-start",
                                            },
                                            [
                                                icon(
                                                    "Check Icon",
                                                    {
                                                        fontSize: "18px",
                                                        color: TOKENS.accent,
                                                        flexShrink: "0",
                                                        marginTop: "2px",
                                                    },
                                                    "✓"
                                                ),
                                                text(
                                                    "Feat",
                                                    {
                                                        fontSize: r(device, "14px", "14px", "15px"),
                                                        color: TOKENS.text,
                                                        lineHeight: "1.5",
                                                    },
                                                    f
                                                ),
                                            ]
                                        )
                                    )
                                ),
                            ]
                        )
                    ),
                ]
            ),
        ]
    );
