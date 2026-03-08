import { EditorElement, DeviceTypes } from "@/lib/types/editor";
import { TOKENS } from "./tokens";
import { r, genId, section, container, text, link, icon } from "./utils";

// ─── Shared responsive helpers ──────────────────────────────────────────────

const badge = (device: DeviceTypes, label: string, accent = TOKENS.accent, accentBg = TOKENS.accentBg): EditorElement =>
    text("Badge", {
        fontSize: r(device, "11px", "12px", "12px"),
        fontWeight: "700",
        color: accent,
        background: accentBg,
        padding: r(device, "5px 14px", "6px 16px", "6px 18px"),
        borderRadius: "100px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        display: "inline-block",
    }, "", label);

const heading = (device: DeviceTypes, headingText: string, colorOverride?: string): EditorElement =>
    text("Heading", {
        fontSize: r(device, "32px", "40px", "52px"),
        fontWeight: "900",
        color: colorOverride || TOKENS.text,
        letterSpacing: "-1.5px",
        lineHeight: "1.1",
        wordBreak: "break-word",
    }, "", headingText);

const subheading = (device: DeviceTypes, subText: string, colorOverride?: string): EditorElement =>
    text("Subheading", {
        fontSize: r(device, "15px", "17px", "18px"),
        color: colorOverride || TOKENS.muted,
        lineHeight: "1.7",
        maxWidth: "580px",
    }, "", subText);

const ctaButton = (device: DeviceTypes, label: string, href = "#"): EditorElement =>
    link("CTA Button", {
        background: TOKENS.accent,
        color: "#ffffff",
        textDecoration: "none",
        fontWeight: "700",
        fontSize: r(device, "14px", "15px", "16px"),
        padding: r(device, "14px 28px", "15px 32px", "16px 40px"),
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
        transition: TOKENS.transition,
        display: "inline-block",
    }, "", href, label);

const secondaryButton = (device: DeviceTypes, label: string, href = "#"): EditorElement =>
    link("Secondary Button", {
        background: "transparent",
        color: TOKENS.accent,
        textDecoration: "none",
        fontWeight: "600",
        fontSize: r(device, "14px", "15px", "16px"),
        padding: r(device, "13px 24px", "14px 28px", "15px 32px"),
        borderRadius: "12px",
        border: `1.5px solid ${TOKENS.accent}`,
        transition: TOKENS.transition,
        display: "inline-block",
    }, "", href, label);

const sectionHeader = (device: DeviceTypes, badgeText: string, titleText: string, subText: string): EditorElement =>
    container("Section Header", {
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: r(device, "14px", "16px", "18px"),
        marginBottom: r(device, "48px", "56px", "72px"),
    }, "", [
        badge(device, badgeText),
        heading(device, titleText),
        subheading(device, subText),
    ]);

// ─── 1. HERO – Gradient ──────────────────────────────────────────────────────

export const createHeroGradient = (device: DeviceTypes = "Desktop"): EditorElement =>
    section("Hero – Gradient", {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        padding: r(device, "80px 20px", "100px 32px", "120px 40px"),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: r(device, "70vh", "80vh", "90vh"),
    }, "", [
        container("Hero Content", {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: r(device, "20px", "22px", "24px"),
            maxWidth: "780px",
            width: "100%",
        }, "", [
            text("Launch Badge", {
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: r(device, "5px 14px", "6px 16px", "6px 18px"),
                borderRadius: "100px",
                fontSize: r(device, "12px", "12px", "13px"),
                fontWeight: "700",
                backdropFilter: "blur(8px)",
                display: "inline-block",
            }, "", "◆ New – Just Launched"),
            text("Hero Title", {
                fontSize: r(device, "36px", "52px", "72px"),
                fontWeight: "900",
                color: "#fff",
                lineHeight: "1.1",
                letterSpacing: "-2px",
                wordBreak: "break-word",
            }, "", "Build Something Amazing Today"),
            text("Hero Subtitle", {
                fontSize: r(device, "16px", "17px", "19px"),
                color: "rgba(255,255,255,0.85)",
                lineHeight: "1.7",
                maxWidth: "520px",
            }, "", "The fastest way to build modern websites without writing code. Drag, drop, and publish instantly."),
            container("CTA Row", {
                display: "flex",
                flexDirection: r(device, "column", "row", "row"),
                gap: r(device, "12px", "14px", "16px"),
                alignItems: "center",
                justifyContent: "center",
                width: r(device, "100%", "auto", "auto"),
            }, "", [
                link("Primary CTA", {
                    background: "#fff",
                    color: "#764ba2",
                    textDecoration: "none",
                    fontWeight: "800",
                    fontSize: r(device, "15px", "15px", "16px"),
                    padding: r(device, "14px 28px", "15px 32px", "16px 40px"),
                    borderRadius: "14px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    transition: TOKENS.transition,
                    display: r(device, "block", "inline-block", "inline-block"),
                    textAlign: "center",
                    width: r(device, "100%", "auto", "auto"),
                }, "", "#", "Get Started Free"),
                link("Secondary CTA", {
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    border: "2px solid rgba(255,255,255,0.4)",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: r(device, "15px", "15px", "16px"),
                    padding: r(device, "12px 24px", "13px 28px", "14px 36px"),
                    borderRadius: "14px",
                    backdropFilter: "blur(8px)",
                    transition: TOKENS.transition,
                    display: r(device, "block", "inline-block", "inline-block"),
                    textAlign: "center",
                    width: r(device, "100%", "auto", "auto"),
                }, "", "#", "Watch Demo →"),
            ]),
            text("Social Proof", {
                color: "rgba(255,255,255,0.65)",
                fontSize: r(device, "13px", "13px", "14px"),
            }, "", "Trusted by 10,000+ teams worldwide"),
        ]),
    ]);

// ─── 2. HERO – Dark Minimal ───────────────────────────────────────────────────

export const createHeroDark = (device: DeviceTypes = "Desktop"): EditorElement =>
    section("Hero – Dark", {
        background: "#0a0a0a",
        padding: r(device, "80px 20px", "100px 32px", "120px 40px"),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: r(device, "70vh", "80vh", "90vh"),
    }, "", [
        container("Dark Hero Content", {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: r(device, "20px", "22px", "24px"),
            maxWidth: "700px",
            width: "100%",
        }, "", [
            text("Pill Badge", {
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.4)",
                color: "#a5b4fc",
                padding: r(device, "5px 14px", "6px 16px", "6px 18px"),
                borderRadius: "100px",
                fontSize: r(device, "12px", "12px", "13px"),
                fontWeight: "600",
                display: "inline-block",
            }, "", "→ v2.0 Just Launched"),
            text("Dark Title", {
                fontSize: r(device, "38px", "58px", "80px"),
                fontWeight: "900",
                color: "#fff",
                lineHeight: "1.1",
                letterSpacing: "-2px",
                wordBreak: "break-word",
            }, "", "The Future of Web Building"),
            text("Dark Subtitle", {
                fontSize: r(device, "16px", "17px", "18px"),
                color: "#9ca3af",
                lineHeight: "1.7",
                maxWidth: "500px",
            }, "", "Create stunning websites in minutes. No code required. Export clean HTML & CSS instantly."),
            link("Dark CTA", {
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: r(device, "15px", "15px", "16px"),
                padding: r(device, "14px 32px", "15px 36px", "16px 40px"),
                borderRadius: "14px",
                boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
                transition: TOKENS.transition,
                display: "inline-block",
            }, "", "#", "Start Building Free"),
            container("Stats Row", {
                display: "flex",
                gap: r(device, "24px", "32px", "40px"),
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
            }, "", [
                ...(["50K+\nProjects", "99%\nUptime", "4.9★\nRating"].map((stat, i) => {
                    const [num, label] = stat.split("\n");
                    return container(`Stat ${i + 1}`, { textAlign: "center" }, "", [
                        text(`Stat Num ${i + 1}`, { fontSize: r(device, "20px", "22px", "24px"), fontWeight: "800", color: "#fff" }, "", num),
                        text(`Stat Label ${i + 1}`, { fontSize: "12px", color: "#6b7280", marginTop: "2px" }, "", label),
                    ]);
                })),
            ]),
        ]),
    ]);

// ─── 3. FEATURES GRID ────────────────────────────────────────────────────────

const FEATURES = [
    { icon: "⚡", title: "Lightning Fast", desc: "Optimized for speed with sub-second load times and a perfect Lighthouse score.", gradient: "linear-gradient(135deg,#f59e0b,#f97316)" },
    { icon: "◈", title: "Secure by Default", desc: "Enterprise-grade security with SSL, DDoS protection, and daily backups.", gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
    { icon: "◆", title: "Beautiful Design", desc: "Stunning UI components crafted by world-class designers and ready to use.", gradient: "linear-gradient(135deg,#ec4899,#f43f5e)" },
    { icon: "▣", title: "Fully Responsive", desc: "Every component adapts perfectly to any screen size, from mobile to 4K.", gradient: "linear-gradient(135deg,#10b981,#06b6d4)" },
    { icon: "⊕", title: "Easy Integrations", desc: "Connect to 1000+ apps including Stripe, Notion, and Hubspot with one click.", gradient: "linear-gradient(135deg,#8b5cf6,#d946ef)" },
    { icon: "⊞", title: "Advanced Analytics", desc: "Deep insights into your visitors, conversions, and revenue in one dashboard.", gradient: "linear-gradient(135deg,#0ea5e9,#6366f1)" },
];

export const createFeaturesGrid = (device: DeviceTypes = "Desktop"): EditorElement =>
    section("Features Grid", {
        background: "#fff",
        padding: r(device, "80px 20px", "100px 32px", "120px 40px"),
    }, "", [
        sectionHeader(device, "Features", "Everything You Need to Succeed",
            "Powerful tools that help you build, launch, and grow faster than ever before."),
        container("Features Grid", {
            display: "grid",
            gridTemplateColumns: r(device, "1fr", "1fr 1fr", "1fr 1fr 1fr"),
            gap: r(device, "16px", "20px", "24px"),
            maxWidth: "1100px",
            margin: "0 auto",
            width: "100%",
        }, "", FEATURES.map((f, i) =>
            container(`Feature Card ${i + 1}`, {
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: r(device, "16px", "18px", "20px"),
                padding: r(device, "28px 24px", "32px 28px", "36px 32px"),
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                transition: TOKENS.transition,
            }, "", [
                text(`Feature Icon ${i + 1}`, {
                    width: r(device, "42px", "44px", "48px"),
                    height: r(device, "42px", "44px", "48px"),
                    borderRadius: "12px",
                    background: f.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: r(device, "18px", "20px", "22px"),
                    color: "#fff",
                }, "", f.icon),
                text(`Feature Title ${i + 1}`, { fontSize: r(device, "16px", "17px", "18px"), fontWeight: "700", color: TOKENS.text }, "", f.title),
                text(`Feature Desc ${i + 1}`, { fontSize: r(device, "13px", "14px", "15px"), color: TOKENS.muted, lineHeight: "1.6" }, "", f.desc),
            ])
        )),
    ]);

// ─── 4. PRICING TABLE ────────────────────────────────────────────────────────

const PLANS = [
    { name: "Starter", price: "$0", desc: "Perfect for side projects.", features: ["5 Projects", "1 GB Storage", "Basic Analytics"], popular: false },
    { name: "Pro", price: "$29", desc: "For growing teams that need more power.", features: ["50 Projects", "50 GB Storage", "Advanced Analytics", "Custom Domain"], popular: true },
    { name: "Enterprise", price: "$99", desc: "For large orgs with custom needs.", features: ["Unlimited Projects", "1 TB Storage", "Advanced Analytics", "Custom Domain", "Priority Support"], popular: false },
];

export const createPricingTable = (device: DeviceTypes = "Desktop"): EditorElement =>
    section("Pricing Table", {
        background: "linear-gradient(to bottom, #f8fafc, #eff6ff)",
        padding: r(device, "80px 20px", "100px 32px", "120px 40px"),
        textAlign: "center",
    }, "", [
        sectionHeader(device, "Pricing", "Simple, Transparent Pricing",
            "No hidden fees. Cancel anytime. Start free, scale as you grow."),
        container("Pricing Grid", {
            display: "flex",
            flexDirection: r(device, "column", "row", "row"),
            gap: r(device, "16px", "20px", "24px"),
            maxWidth: "1060px",
            margin: "0 auto",
            alignItems: r(device, "stretch", "center", "center"),
            width: "100%",
        }, "", PLANS.map((plan, i) =>
            container(`Plan Card ${i + 1}`, {
                background: "#fff",
                border: plan.popular ? "2px solid #6366f1" : "1px solid #e2e8f0",
                borderRadius: r(device, "20px", "22px", "24px"),
                padding: r(device, "32px 24px", "36px 28px", "40px 32px"),
                flex: "1",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow: plan.popular ? "0 20px 60px -10px rgba(99,102,241,0.25)" : "none",
                position: "relative",
            }, "", [
                ...(plan.popular ? [text("Popular Badge", {
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: "#fff",
                    padding: "4px 16px",
                    borderRadius: "100px",
                    fontSize: "11px",
                    fontWeight: "700",
                    display: "inline-block",
                    alignSelf: "center",
                    marginBottom: "8px",
                }, "", "Most Popular")] : []),
                text(`Plan Name ${i + 1}`, { fontSize: "12px", fontWeight: "700", color: TOKENS.accent, textTransform: "uppercase", letterSpacing: "1px" }, "", plan.name),
                text(`Plan Price ${i + 1}`, { fontSize: r(device, "44px", "48px", "52px"), fontWeight: "900", color: "#0f172a", lineHeight: "1" }, "", plan.price + "/mo"),
                text(`Plan Desc ${i + 1}`, { fontSize: r(device, "13px", "14px", "14px"), color: TOKENS.muted, lineHeight: "1.6" }, "", plan.desc),
                container(`Plan Features ${i + 1}`, {
                    display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px", marginBottom: "8px",
                }, "", plan.features.map((f, j) =>
                    text(`Feature ${i}-${j}`, { fontSize: r(device, "13px", "13px", "14px"), color: TOKENS.text, display: "flex", alignItems: "center", gap: "6px" }, "", `✓ ${f}`)
                )),
                link(`Plan CTA ${i + 1}`, {
                    background: plan.popular ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
                    color: plan.popular ? "#fff" : TOKENS.text,
                    border: plan.popular ? "none" : "2px solid #e2e8f0",
                    textDecoration: "none",
                    fontWeight: "700",
                    fontSize: r(device, "14px", "14px", "15px"),
                    padding: r(device, "12px", "13px", "14px"),
                    borderRadius: "12px",
                    display: "block",
                    textAlign: "center",
                    transition: TOKENS.transition,
                    marginTop: "auto",
                }, "", "#", plan.popular ? "Get Started →" : "Get Started"),
            ])
        )),
    ]);

// ─── 5. TESTIMONIALS ─────────────────────────────────────────────────────────

const TESTIMONIALS = [
    { initials: "JD", name: "Jane Doe", role: "CEO at TechCorp", quote: "This tool completely changed how we build landing pages. We went from weeks to hours. The templates are stunning and actually convert well." },
    { initials: "AS", name: "Alex Smith", role: "Lead Dev at StartupXO", quote: "I've tried every page builder out there. This is by far the cleanest and most intuitive one. The code output is production-ready." },
    { initials: "MK", name: "Maria Kim", role: "Growth Lead at Growify", quote: "Our conversion rate went up 34% after switching to these templates. The designs are modern and the CTA placements are on point." },
];

export const createTestimonials = (device: DeviceTypes = "Desktop"): EditorElement =>
    section("Testimonials", {
        background: "#0a0a14",
        padding: r(device, "80px 20px", "100px 32px", "120px 40px"),
    }, "", [
        sectionHeader(device, "Testimonials", "Loved by Thousands of Teams",
            "Don't take our word for it — hear from the teams who use us every day."),
        container("Testimonials Grid", {
            display: "grid",
            gridTemplateColumns: r(device, "1fr", "1fr 1fr", "1fr 1fr 1fr"),
            gap: r(device, "16px", "20px", "24px"),
            maxWidth: "1100px",
            margin: "0 auto",
            width: "100%",
        }, "", TESTIMONIALS.map((t, i) =>
            container(`Testimonial Card ${i + 1}`, {
                background: i === 1 ? "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.10))" : "#111827",
                border: i === 1 ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: r(device, "16px", "18px", "20px"),
                padding: r(device, "28px 24px", "30px 26px", "32px 28px"),
                display: "flex",
                flexDirection: "column",
                gap: "16px",
            }, "", [
                text(`Stars ${i + 1}`, { color: "#fbbf24", fontSize: "18px", letterSpacing: "2px" }, "", "★★★★★"),
                text(`Quote ${i + 1}`, { fontSize: r(device, "14px", "14px", "15px"), color: "#d1d5db", lineHeight: "1.7", fontStyle: "italic" }, "", `"${t.quote}"`),
                container(`Author ${i + 1}`, { display: "flex", alignItems: "center", gap: "12px" }, "", [
                    text(`Avatar ${i + 1}`, {
                        width: r(device, "40px", "42px", "44px"),
                        height: r(device, "40px", "42px", "44px"),
                        borderRadius: "50%",
                        background: `linear-gradient(135deg,${["#6366f1,#8b5cf6", "#f59e0b,#ef4444", "#10b981,#06b6d4"][i]})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: "700", color: "#fff", fontSize: "14px", flexShrink: "0",
                    }, "", t.initials),
                    container(`Author Info ${i + 1}`, { display: "flex", flexDirection: "column", gap: "2px" }, "", [
                        text(`Author Name ${i + 1}`, { fontWeight: "700", color: "#f9fafb", fontSize: "14px" }, "", t.name),
                        text(`Author Role ${i + 1}`, { fontSize: "12px", color: "#6b7280" }, "", t.role),
                    ]),
                ]),
            ])
        )),
    ]);

// ─── 6. CTA BANNER ───────────────────────────────────────────────────────────

export const createCtaBanner = (device: DeviceTypes = "Desktop"): EditorElement =>
    section("CTA Banner", {
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)",
        padding: r(device, "80px 20px", "100px 32px", "120px 40px"),
        textAlign: "center",
    }, "", [
        container("CTA Content", {
            maxWidth: "700px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: r(device, "20px", "22px", "24px"),
        }, "", [
            text("CTA Title", {
                fontSize: r(device, "32px", "44px", "56px"),
                fontWeight: "900",
                color: "#fff",
                letterSpacing: "-1.5px",
                lineHeight: "1.1",
                wordBreak: "break-word",
            }, "", "Ready to Get Started?"),
            text("CTA Subtitle", {
                fontSize: r(device, "16px", "17px", "18px"),
                color: "rgba(255,255,255,0.8)",
                lineHeight: "1.7",
                maxWidth: "520px",
            }, "", "Join over 10,000 teams building better products with us. Start free, no credit card required."),
            container("CTA Buttons", {
                display: "flex",
                flexDirection: r(device, "column", "row", "row"),
                gap: r(device, "12px", "14px", "16px"),
                alignItems: "center",
                justifyContent: "center",
                width: r(device, "100%", "auto", "auto"),
            }, "", [
                link("CTA Primary", {
                    background: "#fff",
                    color: "#312e81",
                    textDecoration: "none",
                    fontWeight: "700",
                    fontSize: r(device, "15px", "15px", "16px"),
                    padding: r(device, "14px 28px", "15px 32px", "16px 40px"),
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    transition: TOKENS.transition,
                    display: r(device, "block", "inline-block", "inline-block"),
                    textAlign: "center",
                    width: r(device, "100%", "auto", "auto"),
                }, "", "#", "Start Free Trial →"),
                link("CTA Secondary", {
                    background: "rgba(255,255,255,0.1)",
                    color: "#fff",
                    border: "1.5px solid rgba(255,255,255,0.3)",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: r(device, "15px", "15px", "16px"),
                    padding: r(device, "13px 24px", "14px 28px", "15px 36px"),
                    borderRadius: "12px",
                    backdropFilter: "blur(8px)",
                    transition: TOKENS.transition,
                    display: r(device, "block", "inline-block", "inline-block"),
                    textAlign: "center",
                    width: r(device, "100%", "auto", "auto"),
                }, "", "#", "Learn More"),
            ]),
            text("CTA Note", { fontSize: "12px", color: "rgba(255,255,255,0.5)" }, "", "Free 14-day trial · No credit card · Cancel anytime"),
        ]),
    ]);

// ─── 7. TEAM CARDS ───────────────────────────────────────────────────────────

const TEAM = [
    { initials: "JD", name: "Jane Doe", role: "CEO & Co-Founder", bio: "Former engineer at Google. Building the future of web creation.", grad: "#f59e0b,#ef4444" },
    { initials: "AS", name: "Alex Smith", role: "CTO", bio: "Full-stack wizard with 10+ years of experience. Loves Rust and coffee.", grad: "#6366f1,#8b5cf6" },
    { initials: "MK", name: "Maria Kim", role: "Head of Design", bio: "Obsessed with beautiful interfaces. Previously at Figma and Linear.", grad: "#10b981,#06b6d4" },
];

export const createTeamCards = (device: DeviceTypes = "Desktop"): EditorElement =>
    section("Team Cards", {
        background: "#f9fafb",
        padding: r(device, "80px 20px", "100px 32px", "120px 40px"),
        textAlign: "center",
    }, "", [
        sectionHeader(device, "Our Team", "Meet the People Behind the Product",
            "The brilliant minds building the future of web creation."),
        container("Team Grid", {
            display: "grid",
            gridTemplateColumns: r(device, "1fr", "1fr 1fr", "1fr 1fr 1fr"),
            gap: r(device, "16px", "20px", "24px"),
            maxWidth: "960px",
            margin: "0 auto",
            width: "100%",
        }, "", TEAM.map((m, i) =>
            container(`Team Card ${i + 1}`, {
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: r(device, "18px", "20px", "24px"),
                padding: r(device, "28px 20px", "32px 24px", "40px 28px"),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                transition: TOKENS.transition,
            }, "", [
                text(`Avatar ${i + 1}`, {
                    width: r(device, "64px", "72px", "80px"),
                    height: r(device, "64px", "72px", "80px"),
                    borderRadius: "50%",
                    background: `linear-gradient(135deg,${m.grad})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "800", color: "#fff", fontSize: r(device, "20px", "22px", "24px"),
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                }, "", m.initials),
                text(`Member Name ${i + 1}`, { fontSize: r(device, "17px", "17px", "18px"), fontWeight: "700", color: TOKENS.text }, "", m.name),
                text(`Member Role ${i + 1}`, { fontSize: "12px", fontWeight: "700", color: TOKENS.accent, textTransform: "uppercase", letterSpacing: "0.5px" }, "", m.role),
                text(`Member Bio ${i + 1}`, { fontSize: r(device, "13px", "14px", "14px"), color: TOKENS.muted, lineHeight: "1.6", textAlign: "center", maxWidth: "220px" }, "", m.bio),
            ])
        )),
    ]);

// ─── 8. FAQ SECTION ───────────────────────────────────────────────────────────

const FAQS = [
    { q: "How does the free trial work?", a: "You get 14 full days of access to all Pro features. No credit card required to start. Cancel anytime." },
    { q: "Can I change my plan later?", a: "Absolutely. You can upgrade or downgrade your plan at any time from your account dashboard." },
    { q: "Do you offer discounts for annual billing?", a: "Yes! Annual billing saves you 20% compared to the monthly plan. Switch anytime." },
    { q: "Is my data safe?", a: "We take security seriously. All data is encrypted at rest and in transit using industry-standard AES-256 encryption." },
];

export const createFaqSection = (device: DeviceTypes = "Desktop"): EditorElement =>
    section("FAQ Section", {
        background: "#fff",
        padding: r(device, "80px 20px", "100px 32px", "120px 40px"),
    }, "", [
        container("FAQ Inner", {
            maxWidth: "760px",
            margin: "0 auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: r(device, "32px", "40px", "48px"),
        }, "", [
            container("FAQ Header", {
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: r(device, "14px", "16px", "18px"),
            }, "", [
                badge(device, "FAQ"),
                heading(device, "Frequently Asked Questions"),
                subheading(device, "Everything you need to know about the product and billing."),
            ]),
            container("FAQ List", {
                display: "flex",
                flexDirection: "column",
                gap: r(device, "12px", "14px", "16px"),
            }, "", FAQS.map((faq, i) =>
                container(`FAQ Item ${i + 1}`, {
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    padding: r(device, "20px 18px", "22px 20px", "24px 28px"),
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }, "", [
                    text(`FAQ Q ${i + 1}`, { fontSize: r(device, "15px", "15px", "16px"), fontWeight: "700", color: TOKENS.text }, "", faq.q),
                    text(`FAQ A ${i + 1}`, { fontSize: r(device, "13px", "14px", "15px"), color: TOKENS.muted, lineHeight: "1.7" }, "", faq.a),
                ])
            )),
        ]),
    ]);

// ─── 9. STATS/METRICS ROW ─────────────────────────────────────────────────────

export const createStatsRow = (device: DeviceTypes = "Desktop"): EditorElement =>
    section("Stats Row", {
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        padding: r(device, "60px 20px", "70px 32px", "80px 40px"),
    }, "", [
        container("Stats Inner", {
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: r(device, "1fr 1fr", "1fr 1fr 1fr 1fr", "1fr 1fr 1fr 1fr"),
            gap: r(device, "24px 16px", "24px", "32px"),
            width: "100%",
            textAlign: "center",
        }, "", [
            ...(["50K+\nProjects Built", "99.9%\nUptime SLA", "4.9★\nAverage Rating", "180+\nCountries"].map((stat, i) => {
                const [num, label] = stat.split("\n");
                return container(`Stat Block ${i + 1}`, { display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }, "", [
                    text(`Stat Num ${i + 1}`, { fontSize: r(device, "32px", "36px", "44px"), fontWeight: "900", color: "#fff", letterSpacing: "-1px" }, "", num),
                    text(`Stat Label ${i + 1}`, { fontSize: r(device, "12px", "13px", "14px"), color: "rgba(255,255,255,0.75)", lineHeight: "1.4" }, "", label),
                ]);
            })),
        ]),
    ]);

// ─── 10. ABOUT STORY + IMAGE PLACEHOLDERS ─────────────────────────────────────

export const createAboutStorySection = (
    device: DeviceTypes = "Desktop"
): EditorElement =>
    section("About Story", {
        background: TOKENS.bgGradient,
        padding: r(device, "80px 20px", "100px 32px", "120px 40px"),
    }, "", [
        container("About Wrapper", {
            maxWidth: "1120px",
            margin: "0 auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: r(device, "28px", "34px", "40px"),
        }, "", [
            container("About Header", {
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: r(device, "14px", "16px", "18px"),
            }, "", [
                badge(device, "About us"),
                heading(device, "Built by makers for modern SaaS teams"),
                subheading(
                    device,
                    "Share your mission, team story, and product philosophy with structured content and image placeholders."
                ),
            ]),
            container("About Layout", {
                display: "grid",
                gridTemplateColumns: r(device, "1fr", "1fr", "1.05fr 1fr"),
                gap: r(device, "16px", "20px", "24px"),
                alignItems: "stretch",
                width: "100%",
            }, "", [
                container("Image Placeholders Column", {
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    minWidth: "0",
                }, "", [
                    container("About Hero Image Placeholder", {
                        background: "linear-gradient(135deg,#e2e8f0,#f8fafc)",
                        border: "1.5px dashed #cbd5e1",
                        borderRadius: TOKENS.radiusLg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: TOKENS.muted,
                        fontWeight: "600",
                        fontSize: r(device, "13px", "13px", "14px"),
                        minHeight: r(device, "220px", "260px", "300px"),
                        width: "100%",
                    }, "", [
                        text("About Hero Placeholder Label", {
                            color: TOKENS.muted,
                            fontWeight: "600",
                            fontSize: r(device, "13px", "13px", "14px"),
                        }, "", "Image Placeholder 16:9"),
                    ]),
                    container("About Secondary Image Placeholder", {
                        background: "linear-gradient(135deg,#f1f5f9,#ffffff)",
                        border: "1.5px dashed #cbd5e1",
                        borderRadius: TOKENS.radiusMd,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: TOKENS.muted,
                        fontWeight: "600",
                        fontSize: r(device, "12px", "13px", "13px"),
                        minHeight: r(device, "160px", "180px", "200px"),
                        width: "100%",
                    }, "", [
                        text("About Secondary Placeholder Label", {
                            color: TOKENS.muted,
                            fontWeight: "600",
                            fontSize: r(device, "12px", "13px", "13px"),
                        }, "", "Secondary Image Placeholder"),
                    ]),
                ]),
                container("About Story Card", {
                    background: TOKENS.surface,
                    border: TOKENS.border,
                    borderRadius: TOKENS.radiusLg,
                    boxShadow: TOKENS.shadowCard,
                    padding: r(device, "24px 20px", "28px 24px", "32px 28px"),
                    display: "flex",
                    flexDirection: "column",
                    gap: r(device, "12px", "14px", "16px"),
                    minWidth: "0",
                }, "", [
                    text("About Story Heading", {
                        fontSize: r(device, "22px", "24px", "26px"),
                        fontWeight: "700",
                        color: TOKENS.text,
                        letterSpacing: "-0.02em",
                    }, "", "Our Story"),
                    text("About Story Paragraph One", {
                        fontSize: r(device, "14px", "15px", "15px"),
                        color: TOKENS.muted,
                        lineHeight: "1.8",
                    }, "", "We started with one goal: help teams design polished SaaS pages quickly while keeping full editing control over every section and style."),
                    text("About Story Paragraph Two", {
                        fontSize: r(device, "14px", "15px", "15px"),
                        color: TOKENS.muted,
                        lineHeight: "1.8",
                    }, "", "Use this section for product story, founder note, hiring message, or company timeline. Replace placeholders with screenshots or team photos."),
                    container("About Stats", {
                        display: "grid",
                        gridTemplateColumns: r(device, "1fr 1fr", "1fr 1fr 1fr", "1fr 1fr 1fr"),
                        gap: "12px",
                        marginTop: "6px",
                    }, "", [
                        container("About Stat One", {
                            border: TOKENS.border,
                            borderRadius: TOKENS.radiusSm,
                            padding: "12px 10px",
                            textAlign: "center",
                            background: TOKENS.surfaceMuted,
                        }, "", [
                            text("About Stat One Value", {
                                fontSize: r(device, "19px", "20px", "22px"),
                                fontWeight: "800",
                                color: TOKENS.accent,
                            }, "", "10K+"),
                            text("About Stat One Label", {
                                fontSize: "11px",
                                color: TOKENS.muted,
                                marginTop: "4px",
                            }, "", "Active teams"),
                        ]),
                        container("About Stat Two", {
                            border: TOKENS.border,
                            borderRadius: TOKENS.radiusSm,
                            padding: "12px 10px",
                            textAlign: "center",
                            background: TOKENS.surfaceMuted,
                        }, "", [
                            text("About Stat Two Value", {
                                fontSize: r(device, "19px", "20px", "22px"),
                                fontWeight: "800",
                                color: TOKENS.accent,
                            }, "", "120M"),
                            text("About Stat Two Label", {
                                fontSize: "11px",
                                color: TOKENS.muted,
                                marginTop: "4px",
                            }, "", "Monthly views"),
                        ]),
                        container("About Stat Three", {
                            border: TOKENS.border,
                            borderRadius: TOKENS.radiusSm,
                            padding: "12px 10px",
                            textAlign: "center",
                            background: TOKENS.surfaceMuted,
                        }, "", [
                            text("About Stat Three Value", {
                                fontSize: r(device, "19px", "20px", "22px"),
                                fontWeight: "800",
                                color: TOKENS.accent,
                            }, "", "99.9%"),
                            text("About Stat Three Label", {
                                fontSize: "11px",
                                color: TOKENS.muted,
                                marginTop: "4px",
                            }, "", "Uptime"),
                        ]),
                    ]),
                ]),
            ]),
        ]),
    ]);
