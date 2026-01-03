'use client'

import React from 'react'
import { Testimonial } from '@prisma/client'
import { Plus, Trash, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useModal } from '@/hooks/use-modal'
import CustomModal from '@/components/global/custom-modal'
import TestimonialForm from '@/components/forms/testimonial-form'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import Image from 'next/image'
import { deleteTestimonial } from '@/lib/queries'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface TestimonialsClientProps {
    agencyId: string
    data: any[] // Using any for now to avoid strict type issues if Testimonial type is stale
}

const TestimonialsClient: React.FC<TestimonialsClientProps> = ({
    agencyId,
    data,
}) => {
    const { setOpen } = useModal()
    const router = useRouter()
    const { toast } = useToast()

    const handleDelete = async (id: string) => {
        try {
            await deleteTestimonial(id)
            toast({
                title: 'Deleted',
                description: 'Testimonial deleted',
            })
            router.refresh()
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete testimonial',
            })
        }
    }

    const handleEdit = (testimonial: any) => {
        setOpen(
            <CustomModal
                title="Edit Testimonial"
                subTitle="Update the testimonial details."
            >
                <TestimonialForm
                    agencyId={agencyId}
                    initialData={testimonial}
                    closeModal={() => setOpen(null)}
                />
            </CustomModal>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <Button
                    onClick={() => {
                        setOpen(
                            <CustomModal
                                title="Create Testimonial"
                                subTitle="Add a new testimonial for the landing page."
                            >
                                <TestimonialForm
                                    agencyId={agencyId}
                                    closeModal={() => setOpen(null)}
                                />
                            </CustomModal>
                        )
                    }}
                    className="flex gap-2"
                >
                    <Plus size={15} />
                    Create Testimonial
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((testimonial) => (
                    <Card key={testimonial.id} className="flex flex-col justify-between">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="relative h-12 w-12 rounded-full overflow-hidden">
                                <Image
                                    src={testimonial.avatarUrl}
                                    alt={testimonial.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-foreground italic">
                                "{testimonial.message}"
                            </CardDescription>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <span className="text-xs text-muted-foreground">
                                {new Date(testimonial.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEdit(testimonial)}
                                >
                                    <Edit size={15} />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleDelete(testimonial.id)}
                                >
                                    <Trash size={15} />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
                {data.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground p-10">
                        No testimonials found. Add one to get started.
                    </div>
                )}
            </div>
        </div>
    )
}

export default TestimonialsClient
