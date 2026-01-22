"use client";

import React, { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

interface AutoDismissAlertProps {
    type: "success" | "warning";
    title: string;
    description: string;
    duration?: number; // in milliseconds
}

export function AutoDismissAlert({
    type,
    title,
    description,
    duration = 5000,
}: AutoDismissAlertProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    if (!visible) return null;

    const isSuccess = type === "success";

    return (
        <Alert
            className={`transition-opacity duration-300 ${isSuccess
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                    : "border-amber-500 bg-amber-50 dark:bg-amber-950"
                }`}
        >
            {isSuccess ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
                <XCircle className="h-4 w-4 text-amber-500" />
            )}
            <AlertTitle
                className={
                    isSuccess
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-amber-700 dark:text-amber-300"
                }
            >
                {title}
            </AlertTitle>
            <AlertDescription
                className={
                    isSuccess
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                }
            >
                {description}
            </AlertDescription>
        </Alert>
    );
}
