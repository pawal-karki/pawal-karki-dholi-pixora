"use client";

import React from "react";
import { Code, X, Search, Eye, Plus, Sparkles, Zap, Layout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useEditor } from "@/hooks/use-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TEMPLATE_GENERATORS } from "@/lib/editor/template-definitions";

// ─────────────────────────────────────────────────────────────────────────────
// Template registry — maps a template key to its metadata + HTML preview
// (The HTML preview is ONLY used in the iframe preview panel.
//  The actual insertion uses TEMPLATE_GENERATORS which produce EditorElement trees,
//  making every inserted element fully editable via the settings panel.)
// ─────────────────────────────────────────────────────────────────────────────

export type TemplateCategory = "All" | "Hero" | "Features" | "Pricing" | "Testimonials" | "CTA" | "Team" | "FAQ" | "Stats" | "E-commerce" | "Layout";

export type TemplateMeta = {
    id: string; // must match a key in TEMPLATE_GENERATORS
    name: string;
    category: TemplateCategory;
    description: string;
    thumbnail: string;
    gradient: string;
    /** Raw HTML/CSS rendered in the iframe preview ONLY */
    previewHtml: string;
};

export const TEMPLATES: TemplateMeta[] = [
    {
        id: "template__hero_gradient",
        name: "Hero – Gradient",
        category: "Hero",
        description: "Full-width hero with purple gradient, headline, subtitle, and dual CTA buttons",
        thumbnail: "🎨",
        gradient: "from-purple-500 to-pink-500",
        previewHtml: `<style>*{box-sizing:border-box;font-family:system-ui,sans-serif;margin:0}body{background:linear-gradient(135deg,#667eea,#764ba2,#f093fb);min-height:90vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;text-align:center}.c{max-width:700px}.badge{background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3);padding:5px 14px;border-radius:100px;font-size:12px;font-weight:700;display:inline-block;margin-bottom:16px}.h1{font-size:clamp(32px,6vw,64px);font-weight:900;color:#fff;line-height:1.1;letter-spacing:-2px}.sub{font-size:16px;color:rgba(255,255,255,.85);margin:16px 0 24px;line-height:1.7}.btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}.a{padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px}.p{background:#fff;color:#764ba2;box-shadow:0 8px 24px rgba(0,0,0,.2)}.s{background:rgba(255,255,255,.15);color:#fff;border:2px solid rgba(255,255,255,.4);backdrop-filter:blur(8px)}</style><div class="c"><span class="badge">✨ New – Just Launched</span><h1 class="h1">Build Something Amazing Today</h1><p class="sub">The fastest way to build modern websites without writing code.</p><div class="btns"><a href="#" class="a p">Get Started Free</a><a href="#" class="a s">Watch Demo →</a></div></div>`,
    },
    {
        id: "template__hero_dark",
        name: "Hero – Dark",
        category: "Hero",
        description: "Sleek dark hero with indigo glow, animated badge, and CTA",
        thumbnail: "🌑",
        gradient: "from-gray-900 to-indigo-900",
        previewHtml: `<style>*{box-sizing:border-box;font-family:system-ui,sans-serif;margin:0}body{background:#0a0a0a;min-height:90vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;text-align:center}.c{max-width:640px}.pill{background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.4);color:#a5b4fc;padding:5px 14px;border-radius:100px;font-size:12px;font-weight:600;display:inline-block;margin-bottom:20px}.h1{font-size:clamp(36px,6vw,72px);font-weight:900;color:#fff;line-height:1.1;letter-spacing:-2px}.glow{background:linear-gradient(90deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.sub{font-size:16px;color:#9ca3af;margin:16px 0 24px;line-height:1.7}.cta{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 36px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px;display:inline-block;box-shadow:0 8px 24px rgba(99,102,241,.4)}</style><div class="c"><span class="pill">🚀 v2.0 Just Launched</span><h1 class="h1">The Future of <span class="glow">Web Building</span></h1><p class="sub">Create stunning websites in minutes. No code required.</p><a href="#" class="cta">Start Building Free</a></div>`,
    },
    {
        id: "template__features_grid",
        name: "Features Grid",
        category: "Features",
        description: "3-column responsive features grid with icons, titles, and descriptions",
        thumbnail: "⚡",
        gradient: "from-blue-500 to-cyan-500",
        previewHtml: `<style>*{box-sizing:border-box;font-family:system-ui,sans-serif;margin:0}body{background:#fff;padding:60px 20px}.h{text-align:center;margin-bottom:48px}.h2{font-size:36px;font-weight:800;color:#111;letter-spacing:-1px}.sub{color:#6b7280;font-size:16px;margin-top:10px}.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;max-width:960px;margin:0 auto}.c{background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:28px;transition:.2s}.c:hover{border-color:#c4b5fd;transform:translateY(-4px);box-shadow:0 16px 40px -8px rgba(0,0,0,.1)}.ic{font-size:28px;margin-bottom:12px}.t{font-size:16px;font-weight:700;color:#111;margin-bottom:8px}.d{font-size:13px;color:#6b7280;line-height:1.6}</style><div class="h"><div style="background:#ede9fe;color:#7c3aed;padding:5px 14px;border-radius:100px;font-size:11px;font-weight:700;display:inline-block;margin-bottom:14px;text-transform:uppercase;letter-spacing:1px">Features</div><div class="h2">Everything You Need</div><div class="sub">Powerful tools that help you build, launch, and grow.</div></div><div class="g"><div class="c"><div class="ic">⚡</div><div class="t">Lightning Fast</div><div class="d">Sub-second load times and a perfect Lighthouse score.</div></div><div class="c"><div class="ic">🛡️</div><div class="t">Secure by Default</div><div class="d">Enterprise-grade security with SSL and daily backups.</div></div><div class="c"><div class="ic">📱</div><div class="t">Fully Responsive</div><div class="d">Every component adapts perfectly to any screen size.</div></div></div>`,
    },
    {
        id: "template__pricing_table",
        name: "Pricing Table",
        category: "Pricing",
        description: "3-tier pricing cards with highlighted popular plan and feature lists",
        thumbnail: "💰",
        gradient: "from-emerald-500 to-teal-500",
        previewHtml: `<style>*{box-sizing:border-box;font-family:system-ui,sans-serif;margin:0}body{background:linear-gradient(to bottom,#f8fafc,#eff6ff);padding:60px 20px;text-align:center}.h2{font-size:36px;font-weight:800;color:#0f172a;letter-spacing:-1px;margin-bottom:48px}.g{display:flex;gap:20px;max-width:900px;margin:0 auto;align-items:center;flex-wrap:wrap;justify-content:center}.c{background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:32px 24px;flex:1;min-width:220px;text-align:left}.pop{border:2px solid #6366f1;box-shadow:0 16px 40px -8px rgba(99,102,241,.25);transform:scale(1.04)}.pl{font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}.pr{font-size:44px;font-weight:900;color:#0f172a;line-height:1;margin-bottom:16px}.fl{list-style:none;padding:0;display:flex;flex-direction:column;gap:8px;font-size:13px;color:#374151;margin-bottom:24px}.btn{display:block;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;text-align:center;font-size:14px}.p1{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff}.p2{border:2px solid #e2e8f0;color:#374151}</style><div class="h2">Simple, Transparent Pricing</div><div class="g"><div class="c"><div class="pl">Starter</div><div class="pr">$0<span style="font-size:16px;color:#94a3b8">/mo</span></div><ul class="fl"><li>✅ 5 Projects</li><li>✅ 1 GB Storage</li><li>❌ Custom Domain</li></ul><a href="#" class="btn p2">Get Started</a></div><div class="c pop"><div class="pl">Pro</div><div class="pr">$29<span style="font-size:16px;color:#94a3b8">/mo</span></div><ul class="fl"><li>✅ 50 Projects</li><li>✅ 50 GB Storage</li><li>✅ Custom Domain</li></ul><a href="#" class="btn p1">Get Started</a></div><div class="c"><div class="pl">Enterprise</div><div class="pr">$99<span style="font-size:16px;color:#94a3b8">/mo</span></div><ul class="fl"><li>✅ Unlimited Projects</li><li>✅ 1 TB Storage</li><li>✅ Priority Support</li></ul><a href="#" class="btn p2">Contact Sales</a></div></div>`,
    },
    {
        id: "template__testimonials",
        name: "Testimonials",
        category: "Testimonials",
        description: "Dark-theme testimonial cards with avatar, quote, name, and star rating",
        thumbnail: "⭐",
        gradient: "from-slate-800 to-slate-900",
        previewHtml: `<style>*{box-sizing:border-box;font-family:system-ui,sans-serif;margin:0}body{background:#0a0a14;padding:60px 20px;text-align:center}.h2{font-size:32px;font-weight:800;color:#fff;margin-bottom:40px}.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;max-width:960px;margin:0 auto}.c{background:#111827;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:24px;text-align:left}.hi{background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.1));border-color:rgba(99,102,241,.4)}.st{color:#fbbf24;font-size:16px;margin-bottom:12px}.q{font-size:13px;color:#d1d5db;line-height:1.7;font-style:italic;margin-bottom:16px}.au{display:flex;align-items:center;gap:10px}.av{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:12px;flex-shrink:0}.nm{font-weight:700;color:#f9fafb;font-size:13px}.rl{font-size:11px;color:#6b7280}</style><div class="h2">Loved by Thousands of Teams</div><div class="g"><div class="c"><div class="st">★★★★★</div><div class="q">"This tool completely changed how we build landing pages. The templates are stunning."</div><div class="au"><div class="av">JD</div><div><div class="nm">Jane Doe</div><div class="rl">CEO at TechCorp</div></div></div></div><div class="c hi"><div class="st">★★★★★</div><div class="q">"By far the cleanest, fastest, and most intuitive builder. Code output is production-ready."</div><div class="au"><div class="av" style="background:linear-gradient(135deg,#f59e0b,#ef4444)">AS</div><div><div class="nm">Alex Smith</div><div class="rl">Lead Dev at StartupXO</div></div></div></div></div>`,
    },
    {
        id: "template__cta_banner",
        name: "CTA Banner",
        category: "CTA",
        description: "High-converting deep-blue CTA with dual buttons and trust text",
        thumbnail: "🎯",
        gradient: "from-indigo-700 to-blue-700",
        previewHtml: `<style>*{box-sizing:border-box;font-family:system-ui,sans-serif;margin:0}body{background:linear-gradient(135deg,#1e1b4b,#312e81,#1e40af);min-height:60vh;display:flex;align-items:center;justify-content:center;padding:60px 20px;text-align:center}.c{max-width:640px}.h1{font-size:clamp(28px,5vw,52px);font-weight:900;color:#fff;letter-spacing:-1.5px;line-height:1.1;margin-bottom:16px}.sub{font-size:16px;color:rgba(255,255,255,.8);line-height:1.7;margin-bottom:28px}.btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}.a{padding:14px 28px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px}.p{background:#fff;color:#312e81;box-shadow:0 4px 16px rgba(0,0,0,.2)}.s{background:rgba(255,255,255,.1);color:#fff;border:1.5px solid rgba(255,255,255,.3);backdrop-filter:blur(8px)}.note{font-size:12px;color:rgba(255,255,255,.5);margin-top:14px}</style><div class="c"><div class="h1">Ready to Get Started?</div><div class="sub">Join 10,000+ teams building better products. Start free, no credit card required.</div><div class="btns"><a href="#" class="a p">Start Free Trial →</a><a href="#" class="a s">Learn More</a></div><div class="note">Free 14-day trial · No credit card · Cancel anytime</div></div>`,
    },
    {
        id: "template__team_cards",
        name: "Team Cards",
        category: "Team",
        description: "Team member cards with gradient avatar, name, role, and bio",
        thumbnail: "👥",
        gradient: "from-rose-400 to-orange-400",
        previewHtml: `<style>*{box-sizing:border-box;font-family:system-ui,sans-serif;margin:0}body{background:#f9fafb;padding:60px 20px;text-align:center}.h2{font-size:32px;font-weight:800;color:#111;margin-bottom:40px}.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;max-width:860px;margin:0 auto}.c{background:#fff;border:1px solid #e5e7eb;border-radius:22px;padding:32px 20px;transition:.2s}.c:hover{transform:translateY(-6px);box-shadow:0 20px 48px -12px rgba(0,0,0,.15)}.av{width:70px;height:70px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;margin:0 auto 14px;box-shadow:0 6px 18px rgba(0,0,0,.15)}.nm{font-size:17px;font-weight:700;color:#111;margin-bottom:4px}.rl{font-size:11px;color:#6366f1;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}.bi{font-size:13px;color:#6b7280;line-height:1.6}</style><div class="h2">Meet Our Team</div><div class="g"><div class="c"><div class="av" style="background:linear-gradient(135deg,#f59e0b,#ef4444)">JD</div><div class="nm">Jane Doe</div><div class="rl">CEO & Co-Founder</div><div class="bi">Former engineer at Google. Building the future of web creation.</div></div><div class="c"><div class="av" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">AS</div><div class="nm">Alex Smith</div><div class="rl">CTO</div><div class="bi">Full-stack wizard with 10+ years of experience.</div></div><div class="c"><div class="av" style="background:linear-gradient(135deg,#10b981,#06b6d4)">MK</div><div class="nm">Maria Kim</div><div class="rl">Head of Design</div><div class="bi">Previously at Figma and Linear. Obsessed with beautiful interfaces.</div></div></div>`,
    },
    {
        id: "template__faq_section",
        name: "FAQ Section",
        category: "FAQ",
        description: "Accordion-style FAQ with 4 questions and clean card layout",
        thumbnail: "❓",
        gradient: "from-slate-500 to-slate-700",
        previewHtml: `<style>*{box-sizing:border-box;font-family:system-ui,sans-serif;margin:0}body{background:#fff;padding:60px 20px}.inner{max-width:700px;margin:0 auto}.h{text-align:center;margin-bottom:40px}.h2{font-size:32px;font-weight:800;color:#111;letter-spacing:-1px}.sub{font-size:16px;color:#6b7280;margin-top:10px}.faq{display:flex;flex-direction:column;gap:12px}.item{background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:20px 22px}.q{font-size:15px;font-weight:700;color:#111;margin-bottom:8px}.a{font-size:14px;color:#6b7280;line-height:1.7}</style><div class="inner"><div class="h"><div class="h2">Frequently Asked Questions</div><div class="sub">Everything you need to know about the product and billing.</div></div><div class="faq"><div class="item"><div class="q">How does the free trial work?</div><div class="a">You get 14 full days of access to all Pro features. No credit card required to start.</div></div><div class="item"><div class="q">Can I change my plan later?</div><div class="a">Absolutely. You can upgrade or downgrade your plan at any time from your dashboard.</div></div><div class="item"><div class="q">Do you offer discounts for annual billing?</div><div class="a">Yes! Annual billing saves you 20% compared to the monthly plan.</div></div></div></div>`,
    },
    {
        id: "template__stats_row",
        name: "Stats Row",
        category: "Stats",
        description: "Gradient stats banner with 4 key metrics in a responsive grid",
        thumbnail: "📊",
        gradient: "from-violet-500 to-purple-600",
        previewHtml: `<style>*{box-sizing:border-box;font-family:system-ui,sans-serif;margin:0}body{background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:60px 20px;text-align:center}.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:24px;max-width:900px;margin:0 auto}.n{font-size:clamp(32px,5vw,48px);font-weight:900;color:#fff;letter-spacing:-1px}.l{font-size:13px;color:rgba(255,255,255,.75);margin-top:6px;line-height:1.4}</style><div class="g"><div><div class="n">50K+</div><div class="l">Projects Built</div></div><div><div class="n">99.9%</div><div class="l">Uptime SLA</div></div><div><div class="n">4.9★</div><div class="l">Average Rating</div></div><div><div class="n">180+</div><div class="l">Countries</div></div></div>`,
    },
    {
        id: "template__modern_navbar",
        name: "Modern Navbar",
        category: "Layout",
        description: "Glassmorphism sticky navbar with logo, links, login and CTA button",
        thumbnail: "🔗",
        gradient: "from-slate-100 to-white",
        previewHtml: `<style>*{box-sizing:border-box;font-family:system-ui,sans-serif;margin:0}body{background:#f1f5f9}.nav{background:rgba(255,255,255,.85);backdrop-filter:blur(16px);border-bottom:1px solid rgba(0,0,0,.06);padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between}.logo{font-size:18px;font-weight:800;color:#111}.links{display:flex;gap:4px}.a{padding:7px 14px;border-radius:8px;font-size:13px;font-weight:500;color:#6b7280;text-decoration:none}.ac{background:#f3f4f6;color:#111;font-weight:600}.cta{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:9px 20px;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;box-shadow:0 4px 12px rgba(99,102,241,.35)}</style><nav class="nav"><div class="logo">◆ Acme Inc</div><div class="links"><a href="#" class="a ac">Home</a><a href="#" class="a">Features</a><a href="#" class="a">Pricing</a></div><a href="#" class="cta">Get Started →</a></nav>`,
    },
    {
        id: "template__modern_footer",
        name: "Modern Footer",
        category: "Layout",
        description: "4-column dark footer with branding, navigation links, and social icons",
        thumbnail: "🔻",
        gradient: "from-gray-900 to-slate-900",
        previewHtml: `<style>*{box-sizing:border-box;font-family:system-ui,sans-serif;margin:0}body{background:#0a0a14}.ft{padding:60px 24px 0}.in{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px}.logo{font-size:18px;font-weight:800;color:#fff;margin-bottom:10px}.tg{font-size:13px;color:#6b7280;line-height:1.7;max-width:220px}.h4{font-size:11px;font-weight:700;color:#f9fafb;text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px}.a{display:block;font-size:13px;color:#6b7280;text-decoration:none;margin-bottom:8px}.bot{border-top:1px solid rgba(255,255,255,.06);padding:20px 0;max-width:1000px;margin:30px auto 0;display:flex;justify-content:space-between;font-size:12px;color:#4b5563}</style><div class="ft"><div class="in"><div><div class="logo">◆ Acme Inc</div><div class="tg">Building the future of the web, one pixel at a time.</div></div><div><div class="h4">Product</div><a href="#" class="a">Features</a><a href="#" class="a">Pricing</a><a href="#" class="a">Changelog</a></div><div><div class="h4">Company</div><a href="#" class="a">About</a><a href="#" class="a">Blog</a><a href="#" class="a">Careers</a></div><div><div class="h4">Legal</div><a href="#" class="a">Privacy</a><a href="#" class="a">Terms</a><a href="#" class="a">Security</a></div></div><div class="bot"><span>© 2025 Acme Inc.</span><span>Made with ❤️ in SF</span></div></div>`,
    },
    {
        id: "template__shop_section",
        name: "Shop Section",
        category: "E-commerce",
        description: "E-commerce layout with product grid on left and shopping cart sidebar on right",
        thumbnail: "🛍️",
        gradient: "from-emerald-500 to-green-600",
        previewHtml: `<style>*{box-sizing:border-box;font-family:system-ui,sans-serif;margin:0}body{background:#f8fafc;padding:40px 20px}.h{text-align:center;margin-bottom:36px}.h2{font-size:30px;font-weight:800;color:#111}.l{display:flex;gap:24px;max-width:1100px;margin:0 auto;flex-wrap:wrap}.main{flex:1;min-width:280px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}.c{background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden}.img{background:linear-gradient(135deg,#f3f4f6,#e5e7eb);height:140px;display:flex;align-items:center;justify-content:center;font-size:36px}.inf{padding:14px}.nm{font-size:14px;font-weight:700;color:#111}.pr{font-size:16px;font-weight:800;color:#6366f1;margin-top:4px}.cart{flex:0 0 260px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:20px}.ct{font-size:16px;font-weight:700;color:#111;margin-bottom:14px}.emp{text-align:center;color:#9ca3af;padding:24px 0;font-size:14px}</style><div class="h"><div class="h2">Our Products</div></div><div class="l"><div class="main"><div class="g"><div class="c"><div class="img">⌚</div><div class="inf"><div class="nm">Classic Watch</div><div class="pr">$199</div></div></div><div class="c"><div class="img">🎧</div><div class="inf"><div class="nm">Headphones</div><div class="pr">$249</div></div></div><div class="c"><div class="img">👟</div><div class="inf"><div class="nm">Urban Runner</div><div class="pr">$129</div></div></div></div></div><div class="cart"><div class="ct">🛒 Your Cart</div><div class="emp">Your cart is empty</div></div></div>`,
    },
];

const CATEGORIES: TemplateCategory[] = ["All", "Hero", "Features", "Pricing", "Testimonials", "CTA", "Team", "FAQ", "Stats", "E-commerce", "Layout"];
export const TEMPLATE_GALLERY_COUNT = TEMPLATES.length;

const CATEGORY_ICONS: Record<TemplateCategory, React.ReactNode> = {
    All: <Sparkles className="w-3.5 h-3.5" />,
    Hero: <Zap className="w-3.5 h-3.5" />,
    Features: <Layout className="w-3.5 h-3.5" />,
    Pricing: <span className="text-xs">💰</span>,
    Testimonials: <span className="text-xs">⭐</span>,
    CTA: <span className="text-xs">🎯</span>,
    Team: <span className="text-xs">👥</span>,
    FAQ: <span className="text-xs">❓</span>,
    Stats: <span className="text-xs">📊</span>,
    "E-commerce": <span className="text-xs">🛍️</span>,
    Layout: <span className="text-xs">🔗</span>,
};

// ─────────────────────────────────────────────────────────────────────────────
// Modal Component
// ─────────────────────────────────────────────────────────────────────────────

interface HtmlTemplatesModalProps {
    onClose: () => void;
}

const HtmlTemplatesModal: React.FC<HtmlTemplatesModalProps> = ({ onClose }) => {
    const { editor: editorState, dispatch } = useEditor();
    const { editor } = editorState;
    const [search, setSearch] = React.useState("");
    const [category, setCategory] = React.useState<TemplateCategory>("All");
    const [preview, setPreview] = React.useState<TemplateMeta | null>(null);
    const [inserting, setInserting] = React.useState<string | null>(null);

    const filtered = TEMPLATES.filter((t) => {
        const matchCat = category === "All" || t.category === category;
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    /**
     * Insert as a fully-editable EditorElement tree.
     * Uses TEMPLATE_GENERATORS so every text, button, and container
     * is individually selectable and editable via the settings panel.
     */
    const handleInsert = (template: TemplateMeta) => {
        const generator = TEMPLATE_GENERATORS[template.id];
        if (!generator) return;

        setInserting(template.id);

        const bodyElement = editor.elements[0];
        if (!bodyElement) {
            setInserting(null);
            return;
        }

        dispatch({
            type: "ADD_ELEMENT",
            payload: {
                containerId: bodyElement.id,
                elementDetails: generator(editor.device),
            },
        });

        setTimeout(() => {
            setInserting(null);
            onClose();
        }, 400);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-background border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b bg-gradient-to-r from-violet-500/5 via-transparent to-transparent">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center mt-0.5">
                                <Sparkles className="w-4 h-4 text-violet-600" />
                            </div>
                            <div>
                                <h2 className="text-base md:text-lg font-semibold">Template Gallery</h2>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Clean SaaS sections that insert as fully editable elements.
                                </p>
                                <div className="mt-2">
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] md:text-xs font-medium"
                                    >
                                        {filtered.length} result{filtered.length === 1 ? "" : "s"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close template gallery">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="px-4 md:px-6 py-4 border-b bg-muted/10 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search templates by name or use case..."
                                className="pl-9 h-10 text-sm rounded-xl bg-background"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                        category === cat
                                            ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                                            : "bg-background text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground"
                                    )}
                                >
                                    {CATEGORY_ICONS[cat]}
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 md:p-6">
                            {preview && (
                                <div className="lg:hidden mb-4 border rounded-xl overflow-hidden bg-muted/10">
                                    <div className="flex items-center justify-between px-3 py-2 border-b bg-background">
                                        <div>
                                            <p className="text-sm font-semibold">{preview.name}</p>
                                            <p className="text-xs text-muted-foreground">Preview</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="gap-1.5 text-xs"
                                            onClick={() => handleInsert(preview)}
                                            disabled={inserting === preview.id}
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            {inserting === preview.id ? "Inserted!" : "Insert"}
                                        </Button>
                                    </div>
                                    <div className="h-[240px] bg-white">
                                        <iframe
                                            key={`${preview.id}-mobile`}
                                            srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}</style></head><body>${preview.previewHtml}</body></html>`}
                                            className="w-full h-full border-0"
                                            sandbox="allow-scripts"
                                            title={`Preview of ${preview.name}`}
                                        />
                                    </div>
                                </div>
                            )}
                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-56 text-muted-foreground border rounded-2xl bg-muted/10">
                                    <Search className="w-8 h-8 mb-3 opacity-40" />
                                    <p className="text-sm font-medium">No matching templates</p>
                                    <p className="text-xs mt-1">Try a different keyword or category.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filtered.map((template) => (
                                        <motion.div
                                            key={template.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                "group relative border rounded-2xl overflow-hidden cursor-pointer transition-all bg-background hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10",
                                                preview?.id === template.id && "border-violet-500 ring-2 ring-violet-500/30"
                                            )}
                                            onClick={() => setPreview(preview?.id === template.id ? null : template)}
                                        >
                                            <div className={cn("h-28 flex flex-col items-center justify-center gap-2 border-b bg-gradient-to-br", template.gradient)}>
                                                <span className="text-3xl drop-shadow-sm">{template.thumbnail}</span>
                                                <Badge variant="secondary" className="text-[10px] bg-white/25 text-white border-0">
                                                    {template.category}
                                                </Badge>
                                            </div>
                                            <div className="p-4 bg-background">
                                                <p className="text-sm font-semibold leading-none mb-1.5">{template.name}</p>
                                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{template.description}</p>
                                            </div>
                                            <div className="px-4 pb-4 flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs gap-1 flex-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreview(template);
                                                    }}
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> Preview
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="h-8 text-xs gap-1 flex-1 bg-violet-600 hover:bg-violet-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleInsert(template);
                                                    }}
                                                    disabled={inserting === template.id}
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    {inserting === template.id ? "Inserted!" : "Insert"}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <AnimatePresence>
                            {preview && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 400, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className="hidden lg:flex border-l bg-background overflow-hidden flex-col flex-shrink-0"
                                >
                                    <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/10">
                                        <div>
                                            <p className="text-sm font-semibold">{preview.name}</p>
                                            <p className="text-xs text-muted-foreground">Editable after insertion</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs"
                                            onClick={() => handleInsert(preview)}
                                            disabled={inserting === preview.id}
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            {inserting === preview.id ? "Inserted!" : "Insert Template"}
                                        </Button>
                                    </div>
                                    <div className="flex-1 overflow-hidden bg-white">
                                        <iframe
                                            key={preview.id}
                                            srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}</style></head><body>${preview.previewHtml}</body></html>`}
                                            className="w-full h-full border-0"
                                            sandbox="allow-scripts"
                                            title={`Preview of ${preview.name}`}
                                        />
                                    </div>
                                    <div className="p-3 border-t bg-muted/10">
                                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 leading-relaxed">
                                            <Code className="w-3 h-3" />
                                            Inserts as editable components. Click any element to style it.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default HtmlTemplatesModal;
