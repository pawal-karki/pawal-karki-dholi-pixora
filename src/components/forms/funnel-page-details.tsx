"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CopyPlusIcon, Info, Loader2, Trash } from "lucide-react";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { type FunnelPage } from "@prisma/client";

import {
    upsertFunnelPage,
    deleteFunnelPage,
    saveActivityLogsNotification,
    getFunnels,
} from "@/lib/queries";

import { useModal } from "@/hooks/use-modal";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
    type FunnelPageDetailsSchema,
    FunnelPageDetailsValidator,
} from "@/lib/validators/funnel-page-details";

interface FunnelPageDetailsProps {
    defaultData?: FunnelPage;
    funnelId: string;
    order: number;
    subAccountId: string;
}

const FunnelPageDetails: React.FC<FunnelPageDetailsProps> = ({
    funnelId,
    order,
    subAccountId,
    defaultData,
}) => {
    const router = useRouter();
    const { setClose } = useModal();

    const form = useForm<FunnelPageDetailsSchema>({
        resolver: zodResolver(FunnelPageDetailsValidator),
        mode: "onChange",
        defaultValues: {
            name: "",
            pathName: "",
        },
    });

    React.useEffect(() => {
        if (defaultData) {
            form.reset({ name: defaultData.name, pathName: defaultData.pathName });
        }
    }, [defaultData, form]);

    const onSubmit: SubmitHandler<FunnelPageDetailsSchema> = async (values) => {
        const currentPathName = values.pathName || form.getValues("pathName");
        if (order !== 0 && !currentPathName)
            return form.setError("pathName", {
                message:
                    "Pages other than the first page in the funnel require a path name example 'secondstep'.",
            });

        try {
            const currentValues = form.getValues();
            const pageData = {
                name: values.name || currentValues.name,
                pathName: values.pathName || currentValues.pathName || "",
                id: defaultData?.id || uuidv4(),
                order: defaultData?.order || order,
                visits: defaultData?.visits || 0,
                content: defaultData?.content || null,
                previewImage: defaultData?.previewImage || null,
            };

            console.log("Submitting funnel page data:", pageData);

            const response = await upsertFunnelPage(subAccountId, funnelId, pageData);

            await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Updated a funnel page | ${response?.name}`,
                subaccountId: subAccountId,
            });

            toast.success("Success", {
                description: "Saved funnel page details",
            });

            setClose();
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Oops!", {
                description: "Could not save funnel page details",
            });
        }
    };

    const handleDeleteFunnelPage = async () => {
        if (!defaultData?.id) return null;

        const response = await deleteFunnelPage(defaultData.id);

        await saveActivityLogsNotification({
            agencyId: undefined,
            description: `Deleted a funnel page | ${response?.name}`,
            subaccountId: subAccountId,
        });

        toast.success("Success", {
            description: "Deleted funnel page",
        });

        router.refresh();
    };

    const handleCopyFunnelPage = async () => {
        const response = await getFunnels(subAccountId);
        const lastFunnelPage = response.find((funnel) => funnel.id === funnelId)
            ?.funnelPages.length;

        await upsertFunnelPage(subAccountId, funnelId, {
            ...defaultData,
            id: uuidv4(),
            order: lastFunnelPage ? lastFunnelPage : 0,
            // @ts-ignore
            visits: 0,
            name: `${defaultData?.name} Copy`,
            pathName: `${defaultData?.pathName}copy`,
            content: defaultData?.content,
        });

        toast.success("Success", {
            description: "Saved funnel page details",
        });

        router.refresh();
    };

    const isLoading = form.formState.isSubmitting || form.formState.isLoading;

    return (
        <TooltipProvider>
            {/* We can remove the Card wrapper here as well if we want it cleaner in the modal, 
          but keeping it for now to match the file structure. 
          Actually, I will remove the Card header/content wrapper to make it cleaner given previous feedback, 
          but keep the component logic. 
      */}
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-6"
                >
                    <FormField
                        disabled={form.formState.isSubmitting}
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        disabled={form.formState.isSubmitting || order === 0}
                        control={form.control}
                        name="pathName"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel className="inline-flex items-center gap-2">
                                    Path Name
                                    {order === 0 && (
                                        <Badge variant="secondary" className="inline-flex gap-2 items-center">
                                            Default
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-3 h-3 cursor-default" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    This is default path name for this funnel
                                                </TooltipContent>
                                            </Tooltip>
                                        </Badge>
                                    )}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Path for the page"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(event) => {
                                            field.onChange(event.target.value.toLowerCase());
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end w-full items-center gap-2">
                        {defaultData?.id && (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="border-destructive text-destructive hover:bg-destructive"
                                            disabled={isLoading}
                                            type="button"
                                            size="icon"
                                            onClick={handleDeleteFunnelPage}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete Funnel Page</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            disabled={form.formState.isSubmitting}
                                            type="button"
                                            onClick={handleCopyFunnelPage}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CopyPlusIcon className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Duplicate Funnel Page</TooltipContent>
                                </Tooltip>
                            </>
                        )}
                        <Button
                            className="w-full"
                            disabled={form.formState.isSubmitting}
                            type="submit"
                        >
                            {isLoading ? "Saving..." : "Save Page"}
                        </Button>
                    </div>
                </form>
            </Form>
        </TooltipProvider>
    );
};

export default FunnelPageDetails;
