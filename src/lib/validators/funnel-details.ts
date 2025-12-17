import { z } from "zod";

export const FunnelDetailsValidator = z.object({
    name: z.string().min(1, { message: "Funnel name is required" }),
    description: z.string().optional(),
    subDomainName: z.string().optional(),
    favicon: z.string().optional(),
});

export type FunnelDetailsSchema = z.infer<typeof FunnelDetailsValidator>;
