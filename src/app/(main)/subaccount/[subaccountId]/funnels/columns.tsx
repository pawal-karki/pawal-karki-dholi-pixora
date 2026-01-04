"use client";

import React from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { type Funnel, type FunnelPage } from "@prisma/client";

type FunnelWithPages = Funnel & {
    funnelPages: FunnelPage[];
};

export const columns: ColumnDef<FunnelWithPages>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            return (
                <Link
                    className="flex gap-2 items-center hover:underline"
                    href={`/subaccount/${row.original.subAccountId}/funnels/${row.original.id}`}
                >
                    {row.getValue("name")}
                    <ExternalLink size={15} className="text-muted-foreground" />
                </Link>
            );
        },
    },
    {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) => {
            const date = ` ${row.original.updatedAt.toDateString()} ${row.original.updatedAt.toLocaleTimeString()} `;
            return <span className="text-muted-foreground">{date}</span>;
        },
    },
    {
        accessorKey: "published",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.published;
            return status ? (
                <Badge variant={"default"}>Live - {row.original.subDomainName}</Badge>
            ) : (
                <Badge variant={"secondary"}>Draft</Badge>
            );
        },
    },
];
