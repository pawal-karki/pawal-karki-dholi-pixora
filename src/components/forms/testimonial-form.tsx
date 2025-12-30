'use client'

import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import FileUpload from '@/components/global/file-upload'
import { upsertTestimonial } from '@/lib/queries'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    message: z.string().min(10, {
        message: "Message must be at least 10 characters.",
    }),
    avatarUrl: z.string().min(1, {
        message: "Avatar is required.",
    }),
})

interface TestimonialFormProps {
    agencyId: string
    initialData?: {
        id: string
        name: string
        message: string
        avatarUrl: string
    }
    closeModal?: () => void
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({
    agencyId,
    initialData,
    closeModal,
}) => {
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || '',
            message: initialData?.message || '',
            avatarUrl: initialData?.avatarUrl || '',
        },
    })

    const isLoading = form.formState.isSubmitting

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await upsertTestimonial(agencyId, {
                ...values,
                id: initialData?.id,
            })
            if (!response) throw new Error('Could not save testimonial')

            toast({
                title: 'Success',
                description: 'Testimonial saved.',
            })

            router.refresh()
            if (closeModal) closeModal()
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Oppse!',
                description: 'Could not save testimonial',
            })
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Testimonial Details</CardTitle>
                <CardDescription>
                    Add or update a testimonial for the landing page.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="avatarUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Avatar</FormLabel>
                                    <FormControl>
                                        <FileUpload
                                            apiEndpoint="avatar"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Great service!"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Testimonial'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default TestimonialForm
