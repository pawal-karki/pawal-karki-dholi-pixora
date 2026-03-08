"use client";

import React from "react";
import {
  AppWindow,
  BadgeDollarSign,
  ChartNoAxesColumn,
  CircleHelp,
  Code,
  Eye,
  FileCode2,
  Grid3X3,
  ImageIcon,
  Layout,
  Megaphone,
  MessageSquareQuote,
  MoonStar,
  Palette,
  PanelBottom,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  TerminalSquare,
  Users,
  X,
  Zap,
} from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useEditor } from "@/hooks/use-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TEMPLATE_GENERATORS } from "@/lib/editor/template-definitions";
import { htmlToEditorElements } from "@/lib/editor/html-to-elements";

export type TemplateCategory =
  | "All"
  | "Hero"
  | "Features"
  | "Pricing"
  | "Testimonials"
  | "CTA"
  | "Team"
  | "FAQ"
  | "Stats"
  | "About"
  | "Layout";

export type TemplateMeta = {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  previewHtml: string;
};

const SVG_ICONS = {
  bolt: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
  palette: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`,
  plug: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a6 6 0 0 1-6 6a6 6 0 0 1-6-6V8z"/></svg>`,
  chart: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="1"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  rocket: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  sparkle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`,
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  grid: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
  dollar: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  diamond: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/></svg>`,
};

const BASE_PREVIEW_STYLE = `*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;word-wrap:break-word;overflow-wrap:break-word}@media(max-width:640px){body{padding:20px 16px!important}.btns,.g.flex,.l,.g{flex-direction:column!important;align-items:stretch!important}.btns a,.btns .a,.g .c .btn,.btn,.cta,.a.p,.a.s{width:100%!important;max-width:100%!important;text-align:center!important;display:block!important}.g{grid-template-columns:1fr!important;gap:16px!important}.l{grid-template-columns:1fr!important}.h2,.t,.ch{font-size:clamp(22px,5vw,32px)!important}.h1{font-size:clamp(28px,6vw,48px)!important}.sub,.d,.q,.pp,.bi,.tg,.fl,.nm,.rl,.lb,.faq .a{font-size:clamp(12px,2.5vw,15px)!important}.pill,.badge,.pl{font-size:clamp(10px,2vw,12px)!important}.c,.item,.st{min-width:0!important;padding:20px 16px!important}.stats{flex-direction:column!important;flex-wrap:wrap!important;gap:16px!important;grid-template-columns:1fr!important}.st .n,.n{font-size:clamp(18px,4vw,24px)!important}.c > .pr{font-size:clamp(28px,6vw,44px)!important}.inf .pr{font-size:clamp(14px,3vw,16px)!important}.pop{transform:none!important}.in{grid-template-columns:1fr!important;gap:24px!important}.bot{flex-direction:column!important;gap:8px!important;text-align:center!important}.mcta{grid-template-columns:1fr!important;grid-column:span 1!important}.mobile .item{grid-column:span 1!important}.note{flex-wrap:wrap!important;justify-content:center!important}.h,.inner{padding:0 4px!important}.h{margin-bottom:32px!important}.nn{font-size:clamp(16px,4vw,20px)!important}.ft{padding:40px 16px 0!important}.nav{padding:10px 12px!important}.row{flex-wrap:wrap!important}.logo{font-size:clamp(14px,3vw,18px)!important}}`;

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "template__hero_gradient",
    name: "Hero – Gradient",
    category: "Hero",
    description:
      "Full-width hero with gradient background, headline, subtitle, and dual CTA buttons",
    icon: <Palette className="w-8 h-8" />,
    gradient: "from-purple-500 to-pink-500",
    previewHtml: `<style>${BASE_PREVIEW_STYLE}body{background:linear-gradient(135deg,#667eea,#764ba2,#f093fb);min-height:90vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;text-align:center}.c{max-width:700px}.badge{background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.25);padding:6px 16px;border-radius:100px;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:6px;margin-bottom:18px;backdrop-filter:blur(8px)}.h1{font-size:clamp(32px,6vw,64px);font-weight:900;color:#fff;line-height:1.08;letter-spacing:-2px}.sub{font-size:16px;color:rgba(255,255,255,.85);margin:16px 0 28px;line-height:1.7}.btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}.a{padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px;transition:transform .15s}.p{background:#fff;color:#764ba2;box-shadow:0 8px 24px rgba(0,0,0,.18)}.s{background:rgba(255,255,255,.12);color:#fff;border:2px solid rgba(255,255,255,.3);backdrop-filter:blur(8px)}</style><div class="c"><span class="badge">${SVG_ICONS.sparkle} New – Just Launched</span><h1 class="h1">Build Something Amazing Today</h1><p class="sub">The fastest way to build modern websites without writing code.</p><div class="btns"><a href="#" class="a p">Get Started Free</a><a href="#" class="a s">Watch Demo →</a></div></div>`,
  },
  {
    id: "template__hero_dark",
    name: "Hero – Dark",
    category: "Hero",
    description:
      "Sleek dark hero with indigo glow, badge, and CTA with social proof metrics",
    icon: <MoonStar className="w-8 h-8" />,
    gradient: "from-gray-900 to-indigo-900",
    previewHtml: `<style>${BASE_PREVIEW_STYLE}body{background:#09090b;min-height:90vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;text-align:center;position:relative;overflow:hidden}body::before{content:'';position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(99,102,241,.15) 0%,transparent 70%);border-radius:50%}.c{max-width:640px;position:relative}.pill{background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.3);color:#a5b4fc;padding:6px 16px;border-radius:100px;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:6px;margin-bottom:22px}.h1{font-size:clamp(36px,6vw,72px);font-weight:900;color:#fff;line-height:1.08;letter-spacing:-2px}.glow{background:linear-gradient(90deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.sub{font-size:16px;color:#9ca3af;margin:18px 0 28px;line-height:1.7}.cta{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 36px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px;display:inline-block;box-shadow:0 8px 24px rgba(99,102,241,.35);transition:transform .15s}.stats{display:flex;justify-content:center;gap:32px;margin-top:28px}.st .n{font-size:20px;font-weight:800;color:#fff}.st .l{font-size:12px;color:#6b7280;margin-top:2px}</style><div class="c"><span class="pill">${SVG_ICONS.rocket} v2.0 Just Launched</span><h1 class="h1">The Future of <span class="glow">Web Building</span></h1><p class="sub">Create stunning websites in minutes. No code required.</p><a href="#" class="cta">Start Building Free</a><div class="stats"><div class="st"><div class="n">50K+</div><div class="l">Projects</div></div><div class="st"><div class="n">99%</div><div class="l">Uptime</div></div><div class="st"><div class="n">4.9★</div><div class="l">Rating</div></div></div></div>`,
  },
  {
    id: "template__features_grid",
    name: "Features Grid",
    category: "Features",
    description:
      "3-column responsive features grid with SVG icons, titles, and descriptions",
    icon: <Grid3X3 className="w-8 h-8" />,
    gradient: "from-blue-500 to-cyan-500",
    previewHtml: `<style>${BASE_PREVIEW_STYLE}body{background:#fff;padding:60px 20px}.h{text-align:center;margin-bottom:48px}.pill{background:#ede9fe;color:#7c3aed;padding:5px 14px;border-radius:100px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:5px;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px}.h2{font-size:36px;font-weight:800;color:#0f172a;letter-spacing:-1px}.sub{color:#64748b;font-size:16px;margin-top:10px}.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;max-width:960px;margin:0 auto}.c{background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:28px;transition:all .2s}.c:hover{border-color:#c4b5fd;transform:translateY(-4px);box-shadow:0 16px 40px -8px rgba(0,0,0,.1)}.ic{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;color:#fff}.t{font-size:16px;font-weight:700;color:#0f172a;margin-bottom:8px}.d{font-size:13px;color:#64748b;line-height:1.6}</style><div class="h"><div class="pill">${SVG_ICONS.grid} Features</div><div class="h2">Everything You Need</div><div class="sub">Powerful tools that help you build, launch, and grow.</div></div><div class="g"><div class="c"><div class="ic" style="background:linear-gradient(135deg,#f59e0b,#f97316)">${SVG_ICONS.bolt}</div><div class="t">Lightning Fast</div><div class="d">Sub-second load times and a perfect Lighthouse score out of the box.</div></div><div class="c"><div class="ic" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">${SVG_ICONS.shield}</div><div class="t">Secure by Default</div><div class="d">Enterprise-grade security with SSL and daily backups built in.</div></div><div class="c"><div class="ic" style="background:linear-gradient(135deg,#10b981,#06b6d4)">${SVG_ICONS.phone}</div><div class="t">Fully Responsive</div><div class="d">Every component adapts perfectly to any screen size automatically.</div></div></div>`,
  },
  {
    id: "template__pricing_table",
    name: "Pricing Table",
    category: "Pricing",
    description:
      "3-tier pricing cards with highlighted plan and feature checklists",
    icon: <BadgeDollarSign className="w-8 h-8" />,
    gradient: "from-emerald-500 to-teal-500",
    previewHtml: `<style>${BASE_PREVIEW_STYLE}body{background:linear-gradient(to bottom,#f8fafc,#eff6ff);padding:60px 20px;text-align:center}.h2{font-size:36px;font-weight:800;color:#0f172a;letter-spacing:-1px;margin-bottom:48px}.g{display:flex;gap:20px;max-width:900px;margin:0 auto;align-items:center;flex-wrap:wrap;justify-content:center}.c{background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:32px 24px;flex:1;min-width:220px;text-align:left}.pop{border:2px solid #6366f1;box-shadow:0 16px 40px -8px rgba(99,102,241,.25);transform:scale(1.04)}.pl{font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}.pr{font-size:44px;font-weight:900;color:#0f172a;line-height:1;margin-bottom:16px}.pr span{font-size:16px;color:#94a3b8}.fl{list-style:none;padding:0;display:flex;flex-direction:column;gap:8px;font-size:13px;color:#374151;margin-bottom:24px}.fl li{display:flex;align-items:center;gap:6px}.yes{color:#10b981}.no{color:#d1d5db}.btn{display:block;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;text-align:center;font-size:14px;transition:transform .15s}.p1{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff}.p2{border:2px solid #e2e8f0;color:#374151}</style><div class="h2">Simple, Transparent Pricing</div><div class="g"><div class="c"><div class="pl">Starter</div><div class="pr">$0<span>/mo</span></div><ul class="fl"><li><span class="yes">${SVG_ICONS.check}</span>5 Projects</li><li><span class="yes">${SVG_ICONS.check}</span>1 GB Storage</li><li><span class="no">${SVG_ICONS.x}</span>Custom Domain</li></ul><a href="#" class="btn p2">Get Started</a></div><div class="c pop"><div class="pl">Pro</div><div class="pr">$29<span>/mo</span></div><ul class="fl"><li><span class="yes">${SVG_ICONS.check}</span>50 Projects</li><li><span class="yes">${SVG_ICONS.check}</span>50 GB Storage</li><li><span class="yes">${SVG_ICONS.check}</span>Custom Domain</li></ul><a href="#" class="btn p1">Get Started</a></div><div class="c"><div class="pl">Enterprise</div><div class="pr">$99<span>/mo</span></div><ul class="fl"><li><span class="yes">${SVG_ICONS.check}</span>Unlimited Projects</li><li><span class="yes">${SVG_ICONS.check}</span>1 TB Storage</li><li><span class="yes">${SVG_ICONS.check}</span>Priority Support</li></ul><a href="#" class="btn p2">Contact Sales</a></div></div>`,
  },
  {
    id: "template__testimonials",
    name: "Testimonials",
    category: "Testimonials",
    description:
      "Dark-theme testimonial cards with avatar, quote, name, and star ratings",
    icon: <MessageSquareQuote className="w-8 h-8" />,
    gradient: "from-slate-800 to-slate-900",
    previewHtml: `<style>${BASE_PREVIEW_STYLE}body{background:#09090b;padding:60px 20px;text-align:center}.h2{font-size:32px;font-weight:800;color:#fff;margin-bottom:40px}.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;max-width:960px;margin:0 auto}.c{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:24px;text-align:left;transition:border-color .2s}.c:hover{border-color:rgba(99,102,241,.3)}.hi{background:linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.08));border-color:rgba(99,102,241,.3)}.st{display:flex;gap:2px;margin-bottom:12px}.q{font-size:14px;color:#d1d5db;line-height:1.7;font-style:italic;margin-bottom:16px}.au{display:flex;align-items:center;gap:10px}.av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:12px;flex-shrink:0}.nm{font-weight:700;color:#f9fafb;font-size:13px}.rl{font-size:11px;color:#6b7280}</style><div class="h2">Loved by Thousands of Teams</div><div class="g"><div class="c"><div class="st">${SVG_ICONS.star}${SVG_ICONS.star}${SVG_ICONS.star}${SVG_ICONS.star}${SVG_ICONS.star}</div><div class="q">"This tool completely changed how we build landing pages. The templates are stunning."</div><div class="au"><div class="av" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">JD</div><div><div class="nm">Jane Doe</div><div class="rl">CEO at TechCorp</div></div></div></div><div class="c hi"><div class="st">${SVG_ICONS.star}${SVG_ICONS.star}${SVG_ICONS.star}${SVG_ICONS.star}${SVG_ICONS.star}</div><div class="q">"By far the cleanest, fastest, and most intuitive builder. Code output is production-ready."</div><div class="au"><div class="av" style="background:linear-gradient(135deg,#f59e0b,#ef4444)">AS</div><div><div class="nm">Alex Smith</div><div class="rl">Lead Dev at StartupXO</div></div></div></div></div>`,
  },
  {
    id: "template__cta_banner",
    name: "CTA Banner",
    category: "CTA",
    description:
      "High-converting deep-blue CTA section with dual buttons and trust text",
    icon: <Megaphone className="w-8 h-8" />,
    gradient: "from-indigo-700 to-blue-700",
    previewHtml: `<style>${BASE_PREVIEW_STYLE}body{background:linear-gradient(135deg,#1e1b4b,#312e81,#1e40af);min-height:60vh;display:flex;align-items:center;justify-content:center;padding:60px 20px;text-align:center}.c{max-width:640px}.h1{font-size:clamp(28px,5vw,52px);font-weight:900;color:#fff;letter-spacing:-1.5px;line-height:1.08;margin-bottom:16px}.sub{font-size:16px;color:rgba(255,255,255,.8);line-height:1.7;margin-bottom:28px}.btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}.a{padding:14px 28px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px;transition:transform .15s}.p{background:#fff;color:#312e81;box-shadow:0 4px 16px rgba(0,0,0,.2)}.s{background:rgba(255,255,255,.1);color:#fff;border:1.5px solid rgba(255,255,255,.3);backdrop-filter:blur(8px)}.note{font-size:12px;color:rgba(255,255,255,.45);margin-top:16px;display:flex;align-items:center;justify-content:center;gap:6px}</style><div class="c"><div class="h1">Ready to Get Started?</div><div class="sub">Join 10,000+ teams building better products. Start free, no credit card required.</div><div class="btns"><a href="#" class="a p">Start Free Trial →</a><a href="#" class="a s">Learn More</a></div><div class="note">${SVG_ICONS.shield} Free 14-day trial · No credit card · Cancel anytime</div></div>`,
  },
  {
    id: "template__team_cards",
    name: "Team Cards",
    category: "Team",
    description: "Team member cards with gradient avatar, name, role, and bio",
    icon: <Users className="w-8 h-8" />,
    gradient: "from-rose-400 to-orange-400",
    previewHtml: `<style>${BASE_PREVIEW_STYLE}body{background:#f9fafb;padding:60px 20px;text-align:center}.h2{font-size:32px;font-weight:800;color:#0f172a;margin-bottom:40px}.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;max-width:860px;margin:0 auto}.c{background:#fff;border:1px solid #e5e7eb;border-radius:22px;padding:32px 20px;transition:all .2s}.c:hover{transform:translateY(-6px);box-shadow:0 20px 48px -12px rgba(0,0,0,.12)}.av{width:70px;height:70px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;margin:0 auto 14px;box-shadow:0 6px 18px rgba(0,0,0,.12)}.nm{font-size:17px;font-weight:700;color:#0f172a;margin-bottom:4px}.rl{font-size:11px;color:#6366f1;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}.bi{font-size:13px;color:#64748b;line-height:1.6}</style><div class="h2">Meet Our Team</div><div class="g"><div class="c"><div class="av" style="background:linear-gradient(135deg,#f59e0b,#ef4444)">JD</div><div class="nm">Jane Doe</div><div class="rl">CEO & Co-Founder</div><div class="bi">Former engineer at Google. Building the future of web creation.</div></div><div class="c"><div class="av" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">AS</div><div class="nm">Alex Smith</div><div class="rl">CTO</div><div class="bi">Full-stack wizard with 10+ years of experience.</div></div><div class="c"><div class="av" style="background:linear-gradient(135deg,#10b981,#06b6d4)">MK</div><div class="nm">Maria Kim</div><div class="rl">Head of Design</div><div class="bi">Previously at Figma and Linear. Obsessed with beautiful interfaces.</div></div></div>`,
  },
  {
    id: "template__faq_section",
    name: "FAQ Section",
    category: "FAQ",
    description: "Clean FAQ with questions and answers in card layout",
    icon: <CircleHelp className="w-8 h-8" />,
    gradient: "from-slate-500 to-slate-700",
    previewHtml: `<style>${BASE_PREVIEW_STYLE}body{background:#fff;padding:60px 20px}.inner{max-width:700px;margin:0 auto}.h{text-align:center;margin-bottom:40px}.h2{font-size:32px;font-weight:800;color:#0f172a;letter-spacing:-1px}.sub{font-size:16px;color:#64748b;margin-top:10px}.faq{display:flex;flex-direction:column;gap:12px}.item{background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:20px 22px;transition:border-color .2s}.item:hover{border-color:#c4b5fd}.q{font-size:15px;font-weight:700;color:#0f172a;margin-bottom:8px;display:flex;align-items:center;gap:8px}.a{font-size:14px;color:#64748b;line-height:1.7}</style><div class="inner"><div class="h"><div class="h2">Frequently Asked Questions</div><div class="sub">Everything you need to know about the product and billing.</div></div><div class="faq"><div class="item"><div class="q">${SVG_ICONS.info} How does the free trial work?</div><div class="a">You get 14 full days of access to all Pro features. No credit card required to start.</div></div><div class="item"><div class="q">${SVG_ICONS.info} Can I change my plan later?</div><div class="a">Absolutely. You can upgrade or downgrade your plan at any time from your dashboard.</div></div><div class="item"><div class="q">${SVG_ICONS.info} Do you offer discounts for annual billing?</div><div class="a">Yes! Annual billing saves you 20% compared to the monthly plan.</div></div></div></div>`,
  },
  {
    id: "template__stats_row",
    name: "Stats Row",
    category: "Stats",
    description: "Gradient stats banner with 4 key metrics in responsive grid",
    icon: <ChartNoAxesColumn className="w-8 h-8" />,
    gradient: "from-violet-500 to-purple-600",
    previewHtml: `<style>${BASE_PREVIEW_STYLE}body{background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:60px 20px;text-align:center}.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:24px;max-width:900px;margin:0 auto}.n{font-size:clamp(32px,5vw,48px);font-weight:900;color:#fff;letter-spacing:-1px}.l{font-size:13px;color:rgba(255,255,255,.75);margin-top:6px;line-height:1.4}</style><div class="g"><div><div class="n">50K+</div><div class="l">Projects Built</div></div><div><div class="n">99.9%</div><div class="l">Uptime SLA</div></div><div><div class="n">4.9★</div><div class="l">Average Rating</div></div><div><div class="n">180+</div><div class="l">Countries</div></div></div>`,
  },
  {
    id: "template__about_story",
    name: "About Story",
    category: "About",
    description:
      "Modern about section with image placeholders, story content, and trust metrics",
    icon: <ImageIcon className="w-8 h-8" />,
    gradient: "from-slate-700 to-indigo-700",
    previewHtml: `<style>${BASE_PREVIEW_STYLE}body{background:linear-gradient(180deg,#f8fafc,#fff);padding:64px 24px;color:#0f172a}.w{max-width:1080px;margin:0 auto}.h{text-align:center;margin-bottom:44px}.b{display:inline-block;padding:6px 14px;border-radius:999px;background:#eef2ff;color:#4338ca;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.t{font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-.03em;margin-top:14px}.s{font-size:15px;color:#64748b;max-width:640px;margin:14px auto 0;line-height:1.7}.l{display:grid;grid-template-columns:1.1fr 1fr;gap:22px;margin-top:34px}.m{display:grid;grid-template-rows:210px 150px;gap:16px}.img{border:1px dashed #cbd5e1;background:linear-gradient(135deg,#e2e8f0,#f8fafc);border-radius:18px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:13px;font-weight:600}.cc{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:28px}.ch{font-size:22px;font-weight:700;letter-spacing:-.02em}.pp{font-size:14px;color:#475569;line-height:1.8;margin-top:12px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}.st{border:1px solid #e2e8f0;border-radius:14px;padding:12px 10px;text-align:center}.nn{font-size:20px;font-weight:800;color:#4338ca}.lb{font-size:11px;color:#64748b;margin-top:4px}@media(max-width:860px){.l{grid-template-columns:1fr}}</style><div class="w"><div class="h"><span class="b">About us</span><h2 class="t">Built by makers for modern SaaS teams</h2><p class="s">Share your story, mission, and team culture with image placeholders you can replace in seconds.</p></div><div class="l"><div class="m"><div class="img">Image Placeholder 16:9</div><div class="img">Secondary Image</div></div><div class="cc"><h3 class="ch">Our Story</h3><p class="pp">We started with a simple goal: make production-quality landing pages fast to build and easy to scale. Today, thousands of teams rely on our toolkit.</p><div class="stats"><div class="st"><div class="nn">10K+</div><div class="lb">Active teams</div></div><div class="st"><div class="nn">120M</div><div class="lb">Monthly views</div></div><div class="st"><div class="nn">99.9%</div><div class="lb">Platform uptime</div></div></div></div></div></div>`,
  },
  {
    id: "template__modern_navbar",
    name: "Modern Navbar",
    category: "Layout",
    description:
      "SaaS blur-gradient navbar with polished desktop links and icon-based mobile menu",
    icon: <AppWindow className="w-8 h-8" />,
    gradient: "from-slate-100 to-white",
    previewHtml: `<style>${BASE_PREVIEW_STYLE}body{background:#eef2ff;padding:14px}.nav{position:sticky;top:0;background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(248,250,252,.88));backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(148,163,184,.18);border-radius:16px;box-shadow:0 12px 28px -18px rgba(15,23,42,.45);padding:10px 14px}.row{display:flex;align-items:center;justify-content:space-between;gap:12px}.brand{display:flex;align-items:center;gap:8px}.diamond{width:26px;height:26px;border-radius:8px;border:1px solid rgba(79,70,229,.18);background:rgba(79,70,229,.06);display:flex;align-items:center;justify-content:center;color:#4338ca}svg{flex-shrink:0}.logo{font-size:18px;font-weight:800;color:#0f172a}.links{display:flex;gap:4px;background:rgba(15,23,42,.04);border:1px solid rgba(148,163,184,.14);padding:4px;border-radius:999px}.a{padding:8px 14px;border-radius:999px;font-size:12px;font-weight:500;color:#64748b;text-decoration:none;transition:all .15s}.ac{background:#fff;color:#0f172a;box-shadow:0 4px 12px -8px rgba(2,6,23,.4);font-weight:600}.actions{display:flex;gap:8px}.login{background:rgba(79,70,229,.06);border:1px solid rgba(79,70,229,.18);color:#4f46e5}.btn{padding:9px 14px;border-radius:999px;font-size:12px;font-weight:600;text-decoration:none;transition:all .15s}.cta{background:#4f46e5;color:#fff;box-shadow:0 8px 20px -10px rgba(79,70,229,.6)}.mobile{display:none;margin-top:10px;gap:8px;grid-template-columns:1fr 1fr}.item{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid rgba(226,232,240,.9);padding:9px 10px;border-radius:12px;font-size:12px;color:#0f172a}.ic{color:#4f46e5;display:flex;align-items:center}.mcta{grid-column:span 2;display:grid;grid-template-columns:1fr 1fr;gap:8px}.mcta .btn{text-align:center;border-radius:12px}@media(max-width:860px){.links,.actions{display:none}.mobile{display:grid}}</style><nav class="nav"><div class="row"><div class="brand"><span class="diamond">${SVG_ICONS.diamond}</span><span class="logo">Pixora</span></div><div class="links"><a href="#" class="a ac">Home</a><a href="#" class="a">Features</a><a href="#" class="a">Pricing</a><a href="#" class="a">About</a></div><div class="actions"><a href="#" class="btn login">Log in</a><a href="#" class="btn cta">Get Started</a></div></div><div class="mobile"><div class="item"><span class="ic">${SVG_ICONS.home}</span><span>Home</span></div><div class="item"><span class="ic">${SVG_ICONS.grid}</span><span>Features</span></div><div class="item"><span class="ic">${SVG_ICONS.dollar}</span><span>Pricing</span></div><div class="item"><span class="ic">${SVG_ICONS.info}</span><span>About</span></div><div class="mcta"><a href="#" class="btn login">Log in</a><a href="#" class="btn cta">Get Started</a></div></div></nav>`,
  },
  {
    id: "template__modern_footer",
    name: "Modern Footer",
    category: "Layout",
    description:
      "4-column dark footer with branding, navigation links, and social icons",
    icon: <PanelBottom className="w-8 h-8" />,
    gradient: "from-gray-900 to-slate-900",
    previewHtml: `<style>${BASE_PREVIEW_STYLE}body{background:#09090b}.ft{padding:60px 24px 0}.in{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px}.lgo{display:flex;align-items:center;gap:8px;margin-bottom:12px}.lgo svg{color:#6366f1}.logo{font-size:18px;font-weight:800;color:#fff}.tg{font-size:13px;color:#6b7280;line-height:1.7;max-width:220px}.h4{font-size:11px;font-weight:700;color:#f9fafb;text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px}.a{display:block;font-size:13px;color:#6b7280;text-decoration:none;margin-bottom:8px;transition:color .15s}.a:hover{color:#a5b4fc}.bot{border-top:1px solid rgba(255,255,255,.06);padding:20px 0;max-width:1000px;margin:30px auto 0;display:flex;justify-content:space-between;font-size:12px;color:#4b5563}@media(max-width:768px){.in{grid-template-columns:1fr 1fr}}</style><div class="ft"><div class="in"><div><div class="lgo">${SVG_ICONS.diamond}<span class="logo">Acme Inc</span></div><div class="tg">Building the future of the web, one pixel at a time.</div></div><div><div class="h4">Product</div><a href="#" class="a">Features</a><a href="#" class="a">Pricing</a><a href="#" class="a">Changelog</a></div><div><div class="h4">Company</div><a href="#" class="a">About</a><a href="#" class="a">Blog</a><a href="#" class="a">Careers</a></div><div><div class="h4">Legal</div><a href="#" class="a">Privacy</a><a href="#" class="a">Terms</a><a href="#" class="a">Security</a></div></div><div class="bot"><span>© 2025 Acme Inc.</span><span>Built with care</span></div></div>`,
  },
  {
    id: "template__shop_section",
    name: "Shop Section",
    category: "Layout",
    description:
      "E-commerce layout with product grid and shopping cart sidebar",
    icon: <ShoppingBag className="w-8 h-8" />,
    gradient: "from-emerald-500 to-green-600",
    previewHtml: `<style>${BASE_PREVIEW_STYLE}body{background:#f8fafc;padding:40px 20px}.h{text-align:center;margin-bottom:36px}.h2{font-size:30px;font-weight:800;color:#0f172a}.l{display:flex;gap:24px;max-width:1100px;margin:0 auto;flex-wrap:wrap}.main{flex:1;min-width:280px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}.c{background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;transition:all .2s}.c:hover{box-shadow:0 12px 32px -8px rgba(0,0,0,.1)}.img{background:linear-gradient(135deg,#f3f4f6,#e5e7eb);height:140px;display:flex;align-items:center;justify-content:center;color:#94a3b8}.inf{padding:14px}.nm{font-size:14px;font-weight:700;color:#0f172a}.pr{font-size:16px;font-weight:800;color:#6366f1;margin-top:4px}.cart{flex:0 0 260px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:20px}.ct{font-size:16px;font-weight:700;color:#0f172a;margin-bottom:14px;display:flex;align-items:center;gap:6px}.emp{text-align:center;color:#9ca3af;padding:24px 0;font-size:14px}@media(max-width:640px){.inf .pr{font-size:clamp(14px,3vw,16px)!important}.img{height:100px}.cart{flex:1 1 100%}.ct,.nm{font-size:clamp(13px,2.5vw,16px)!important}}</style><div class="h"><div class="h2">Our Products</div></div><div class="l"><div class="main"><div class="g"><div class="c"><div class="img">${SVG_ICONS.diamond}</div><div class="inf"><div class="nm">Classic Watch</div><div class="pr">$199</div></div></div><div class="c"><div class="img">${SVG_ICONS.diamond}</div><div class="inf"><div class="nm">Headphones</div><div class="pr">$249</div></div></div><div class="c"><div class="img">${SVG_ICONS.diamond}</div><div class="inf"><div class="nm">Urban Runner</div><div class="pr">$129</div></div></div></div></div><div class="cart"><div class="ct">${SVG_ICONS.diamond} Your Cart</div><div class="emp">Your cart is empty</div></div></div>`,
  },
];

const CATEGORIES: TemplateCategory[] = [
  "All",
  "Hero",
  "Features",
  "Pricing",
  "Testimonials",
  "CTA",
  "Team",
  "FAQ",
  "Stats",
  "About",
  "Layout",
];
export const TEMPLATE_GALLERY_COUNT = TEMPLATES.length;

const CATEGORY_ICONS: Record<TemplateCategory, React.ReactNode> = {
  All: <Sparkles className="w-3.5 h-3.5" />,
  Hero: <Zap className="w-3.5 h-3.5" />,
  Features: <Layout className="w-3.5 h-3.5" />,
  Pricing: <BadgeDollarSign className="w-3.5 h-3.5" />,
  Testimonials: <MessageSquareQuote className="w-3.5 h-3.5" />,
  CTA: <Megaphone className="w-3.5 h-3.5" />,
  Team: <Users className="w-3.5 h-3.5" />,
  FAQ: <CircleHelp className="w-3.5 h-3.5" />,
  Stats: <ChartNoAxesColumn className="w-3.5 h-3.5" />,
  About: <ImageIcon className="w-3.5 h-3.5" />,
  Layout: <AppWindow className="w-3.5 h-3.5" />,
};

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
  const [showCodeInsert, setShowCodeInsert] = React.useState(false);
  const [codeHtml, setCodeHtml] = React.useState("");
  const [codeCss, setCodeCss] = React.useState("");
  const [codeJs, setCodeJs] = React.useState("");
  const [insertMode, setInsertMode] = React.useState<"raw" | "editable">(
    "editable",
  );

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = category === "All" || t.category === category;
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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

  const handleCodeInsert = () => {
    const bodyElement = editor.elements[0];
    if (!bodyElement || !codeHtml.trim()) return;

    if (insertMode === "editable") {
      const elements = htmlToEditorElements(codeHtml, codeCss);
      for (const element of elements) {
        dispatch({
          type: "ADD_ELEMENT",
          payload: { containerId: bodyElement.id, elementDetails: element },
        });
      }
    } else {
      const fullHtml = codeJs
        ? `${codeHtml}<script>${codeJs}<\/script>`
        : codeHtml;
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: bodyElement.id,
          elementDetails: {
            content: { html: fullHtml, css: codeCss },
            id: crypto.randomUUID(),
            name: "Custom Code Block",
            styles: { width: "100%" },
            type: "customHtml",
          },
        },
      });
    }

    setCodeHtml("");
    setCodeCss("");
    setCodeJs("");
    setShowCodeInsert(false);
    onClose();
  };

  const codePreviewDoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}body{margin:0;padding:0}${codeCss}</style></head><body>${codeHtml}${codeJs ? `<script>${codeJs}<\/script>` : ""}</body></html>`;

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000001] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-background border border-border/70 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-border/70 bg-card shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                {showCodeInsert ? (
                  <FileCode2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Sparkles className="w-4 h-4 text-violet-600" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm md:text-base font-semibold truncate">
                  {showCodeInsert ? "Insert Custom Code" : "Template Gallery"}
                </h2>
                <p className="text-[11px] md:text-xs text-muted-foreground truncate">
                  {showCodeInsert
                    ? "Paste HTML, CSS & JS — auto-converts to editable elements"
                    : `${filtered.length} template${filtered.length === 1 ? "" : "s"} — insert as fully editable sections`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-semibold transition-all border",
                  showCodeInsert
                    ? "bg-violet-600 text-white border-violet-600 hover:bg-violet-700"
                    : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700",
                )}
                onClick={() => setShowCodeInsert(!showCodeInsert)}
              >
                {showCodeInsert ? (
                  <>
                    <Sparkles className="w-3 h-3" /> Templates
                  </>
                ) : (
                  <>
                    <TerminalSquare className="w-3 h-3" /> Custom Code
                  </>
                )}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showCodeInsert ? (
            <div className="flex flex-1 overflow-hidden min-h-0">
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <div className="px-4 md:px-6 py-2.5 border-b border-border/70 bg-card/60 flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Insert mode:
                  </span>
                  <div className="flex items-center gap-0.5 bg-muted/40 p-0.5 rounded-lg border border-border/50">
                    <button
                      className={cn(
                        "px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all",
                        insertMode === "editable"
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => setInsertMode("editable")}
                    >
                      Editable Elements
                    </button>
                    <button
                      className={cn(
                        "px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all",
                        insertMode === "raw"
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => setInsertMode("raw")}
                    >
                      Raw HTML Block
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
                  <div
                    className="flex flex-col min-h-[180px]"
                    style={{ flex: "5 1 0%" }}
                  >
                    <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b border-border/50 shrink-0">
                      <span className="text-[11px] text-muted-foreground font-mono font-medium">
                        index.html
                      </span>
                      <span className="text-[10px] text-emerald-500 font-medium">
                        required
                      </span>
                    </div>
                    <textarea
                      value={codeHtml}
                      onChange={(e) => setCodeHtml(e.target.value)}
                      className="flex-1 w-full font-mono text-xs p-3 bg-[#1a1b26] text-[#c0caf5] resize-none outline-none border-none leading-[1.8] placeholder:text-[#565f89]"
                      spellCheck={false}
                      placeholder={
                        '<section class="hero">\n  <h1>Your heading</h1>\n  <p>Your paragraph text</p>\n  <a href="#" class="btn">Get Started</a>\n</section>'
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Tab") {
                          e.preventDefault();
                          const s = e.currentTarget.selectionStart;
                          const end = e.currentTarget.selectionEnd;
                          setCodeHtml(
                            codeHtml.substring(0, s) +
                              "  " +
                              codeHtml.substring(end),
                          );
                        }
                      }}
                    />
                  </div>
                  <div
                    className="flex flex-col min-h-[140px]"
                    style={{ flex: "3 1 0%" }}
                  >
                    <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-y border-border/50 shrink-0">
                      <span className="text-[11px] text-muted-foreground font-mono font-medium">
                        styles.css
                      </span>
                    </div>
                    <textarea
                      value={codeCss}
                      onChange={(e) => setCodeCss(e.target.value)}
                      className="flex-1 w-full font-mono text-xs p-3 bg-[#1a1b26] text-[#c0caf5] resize-none outline-none border-none leading-[1.8] placeholder:text-[#565f89]"
                      spellCheck={false}
                      placeholder={
                        ".hero {\n  padding: 80px 24px;\n  text-align: center;\n  background: linear-gradient(135deg, #667eea, #764ba2);\n}"
                      }
                    />
                  </div>
                  <div
                    className="flex flex-col min-h-[100px]"
                    style={{ flex: "2 1 0%" }}
                  >
                    <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-y border-border/50 shrink-0">
                      <span className="text-[11px] text-muted-foreground font-mono font-medium">
                        script.js
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        optional
                      </span>
                    </div>
                    <textarea
                      value={codeJs}
                      onChange={(e) => setCodeJs(e.target.value)}
                      className="flex-1 w-full font-mono text-xs p-3 bg-[#1a1b26] text-[#c0caf5] resize-none outline-none border-none leading-[1.8] placeholder:text-[#565f89]"
                      spellCheck={false}
                      placeholder={
                        "// Optional JavaScript\nconsole.log('Hello');"
                      }
                    />
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-border/70 bg-card/80 flex items-center justify-between gap-4 shrink-0">
                  <p className="text-[11px] text-muted-foreground leading-relaxed max-w-sm">
                    {insertMode === "editable"
                      ? "HTML is auto-converted to editable elements — each tag becomes individually selectable."
                      : "Inserts as a single raw HTML block. Edit via the Code Editor panel."}
                  </p>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 shrink-0"
                    onClick={handleCodeInsert}
                    disabled={!codeHtml.trim()}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Insert to Canvas
                  </Button>
                </div>
              </div>

              <div className="hidden lg:flex w-[380px] border-l border-border/70 bg-background flex-col flex-shrink-0">
                <div className="px-4 py-3 border-b border-border/50 bg-muted/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold">Live Preview</span>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden bg-white">
                  {codeHtml.trim() ? (
                    <iframe
                      srcDoc={codePreviewDoc}
                      className="w-full h-full border-0"
                      sandbox="allow-scripts"
                      title="Code preview"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-6 text-center">
                      <Code className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-sm font-medium opacity-60">
                        Live Preview
                      </p>
                      <p className="text-xs opacity-40 mt-1">
                        Start typing HTML to see your output here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 md:px-6 py-4 border-b border-border/70 bg-card/80 space-y-3">
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
                          : "bg-background text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground",
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
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-56 text-muted-foreground border rounded-2xl bg-muted/10">
                      <Search className="w-8 h-8 mb-3 opacity-40" />
                      <p className="text-sm font-medium">
                        No matching templates
                      </p>
                      <p className="text-xs mt-1">
                        Try a different keyword or category.
                      </p>
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
                            preview?.id === template.id &&
                              "border-violet-500 ring-2 ring-violet-500/30",
                          )}
                          onClick={() =>
                            setPreview(
                              preview?.id === template.id ? null : template,
                            )
                          }
                        >
                          <div
                            className={cn(
                              "h-28 flex flex-col items-center justify-center gap-2 border-b bg-gradient-to-br",
                              template.gradient,
                            )}
                          >
                            <span className="text-white drop-shadow-sm">
                              {template.icon}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-white/20 text-white border-0"
                            >
                              {template.category}
                            </Badge>
                          </div>
                          <div className="p-4 bg-background">
                            <p className="text-sm font-semibold leading-none mb-1.5">
                              {template.name}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {template.description}
                            </p>
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
                              {inserting === template.id
                                ? "Inserted!"
                                : "Insert"}
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
                      animate={{ width: 380, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                      className="hidden md:flex border-l bg-background overflow-hidden flex-col flex-shrink-0"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/10">
                        <div>
                          <p className="text-sm font-semibold">
                            {preview.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Editable after insertion
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs"
                          onClick={() => handleInsert(preview)}
                          disabled={inserting === preview.id}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {inserting === preview.id
                            ? "Inserted!"
                            : "Insert Template"}
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
                          Inserts as editable components. Click any element to
                          style it.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

export default HtmlTemplatesModal;
