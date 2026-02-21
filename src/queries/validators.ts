/**
 * Feature validators — co-located in src/queries alongside the server actions.
 * NO "use server" directive — validators are pure Zod schemas (synchronous).
 */

import { z } from "zod";



// ─── Pipeline ─────────────────────────────────────────────────────────────────

export const CreatePipelineValidator = z.object({
    name: z.string().min(1),
});
export type CreatePipelineSchema = z.infer<typeof CreatePipelineValidator>;

// ─── Lane ─────────────────────────────────────────────────────────────────────

export const LaneDetailsValidator = z.object({
    name: z.string().min(1),
    color: z.string(),
});
export type LaneDetailsSchema = z.infer<typeof LaneDetailsValidator>;

// ─── Ticket ───────────────────────────────────────────────────────────────────

const currencyNumberRegex = /^\d+(\.\d{1,2})?$/;

export const TicketDetailsValidator = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    value: z.string().refine((v) => currencyNumberRegex.test(v), {
        message: "Value must be a valid price",
    }),
});
export type TicketDetailsSchema = z.infer<typeof TicketDetailsValidator>;

// ─── Funnel ───────────────────────────────────────────────────────────────────

export const FunnelDetailsValidator = z.object({
    name: z.string().min(1, { message: "Funnel name is required" }),
    description: z.string().optional(),
    subDomainName: z.string().optional(),
    favicon: z.string().optional(),
});
export type FunnelDetailsSchema = z.infer<typeof FunnelDetailsValidator>;

export const FunnelPageDetailsValidator = z.object({
    name: z.string().min(1, { message: "Funnel Page name is required" }),
    pathName: z.string().optional(),
});
export type FunnelPageDetailsSchema = z.infer<typeof FunnelPageDetailsValidator>;

// ─── Media ────────────────────────────────────────────────────────────────────

export const UploadMediaValidator = z.object({
    link: z.string().min(1, { message: "Media file is required" }).url(),
    name: z.string().min(1, { message: "Media name is required" }),
});
export type UploadMediaSchema = z.infer<typeof UploadMediaValidator>;
