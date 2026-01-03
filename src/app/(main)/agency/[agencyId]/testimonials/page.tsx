import React from "react";
import { getTestimonials } from "@/lib/queries";
import TestimonialsClient from "./client";

const Page = async ({ params }: { params: Promise<{ agencyId: string }> }) => {
    const { agencyId } = await params;
    const testimonials = await getTestimonials(agencyId);

    return (
        <div className="flex flex-col gap-4 relative">
            <h1 className="text-4xl">Testimonials</h1>
            <TestimonialsClient agencyId={agencyId} data={testimonials} />
        </div>
    );
};

export default Page;
