"use server";

import { v4 } from "uuid";

import { db } from "@/lib/db";

// ─── Testimonial type ─────────────────────────────────────────────────────────

interface TestimonialInput {
    id?: string;
    name?: string;
    role?: string;
    content?: string;
    avatar?: string;
    rating?: number;
}

// ─── getTestimonials ──────────────────────────────────────────────────────────

export const getTestimonials = async (agencyId: string) => {
    const dbT = db as typeof db & {
        testimonial: {
            findMany: (args: { where?: { agencyId?: string } }) => Promise<unknown[]>;
        };
    };
    return await dbT.testimonial.findMany({ where: { agencyId } });
};

// ─── getAllTestimonials ───────────────────────────────────────────────────────

export const getAllTestimonials = async () => {
    const dbT = db as typeof db & {
        testimonial: { findMany: () => Promise<unknown[]> };
    };
    return await dbT.testimonial.findMany();
};

// ─── upsertTestimonial ────────────────────────────────────────────────────────

export const upsertTestimonial = async (
    agencyId: string,
    testimonial: TestimonialInput
) => {
    const testimonialId = testimonial.id || v4();
    const dbT = db as typeof db & {
        testimonial: {
            upsert: (args: {
                where: { id: string };
                update: TestimonialInput;
                create: TestimonialInput & { id: string; agencyId: string };
            }) => Promise<unknown>;
        };
    };
    return await dbT.testimonial.upsert({
        where: { id: testimonialId },
        update: testimonial,
        create: { ...testimonial, id: testimonialId, agencyId },
    });
};

// ─── deleteTestimonial ────────────────────────────────────────────────────────

export const deleteTestimonial = async (testimonialId: string) => {
    const dbT = db as typeof db & {
        testimonial: {
            delete: (args: { where: { id: string } }) => Promise<unknown>;
        };
    };
    return await dbT.testimonial.delete({ where: { id: testimonialId } });
};
