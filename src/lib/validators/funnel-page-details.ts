import { z } from "zod";

export const FunnelPageDetailsValidator = z.object({
    name: z.string().min(1, { message: "Funnel Page name is required" }),
    pathName: z.string().optional(),
});

export type FunnelPageDetailsSchema = z.infer<
    typeof FunnelPageDetailsValidator
>;
