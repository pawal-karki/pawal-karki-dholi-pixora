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

const funnelSubdomainRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const FunnelDetailsValidator = z.object({
    name: z.string().min(1, { message: "Funnel name is required" }),
    description: z.string().optional(),
    subDomainName: z
        .string()
        .transform((s) => s.trim().toLowerCase())
        .pipe(
            z
                .string()
                .min(1, { message: "Subdomain is required for your live funnel URL" })
                .max(63, { message: "Subdomain must be at most 63 characters" })
                .regex(funnelSubdomainRegex, {
                    message:
                        "Use lowercase letters, numbers, and hyphens only (no spaces or underscores)",
                })
        ),
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
