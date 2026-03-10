/**
 * src/lib/queries.ts — barrel re-export
 *
 * All server action functions live in feature files under src/queries/.
 * Validators live in src/queries/validators.ts (no "use server").
 * This file keeps every existing import site working without changes.
 */

// ─── Server Actions ───────────────────────────────────────────────────────────
export * from "@/queries/auth";
export * from "@/queries/notifications";
export * from "@/queries/agency";
export * from "@/queries/subaccounts";
export * from "@/queries/users";
export * from "@/queries/funnels";
export * from "@/queries/media";
export * from "@/queries/contacts";
export * from "@/queries/products";
export * from "@/queries/testimonials";
export * from "@/queries/pipelines";
export * from "@/queries/lanes";
export * from "@/queries/tickets";
export * from "@/queries/tags";
export * from "@/queries/chat";
export * from "@/queries/contact-messages";

// ─── Validators (not server actions — safe to re-export here) ─────────────────
export * from "@/queries/validators";
