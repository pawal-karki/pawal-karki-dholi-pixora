"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AgencyError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    React.useEffect(() => {
        console.error("[agency-error]", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4 p-8 max-w-md">
                <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
                <h2 className="text-xl font-bold">Something went wrong</h2>
                <p className="text-muted-foreground text-sm">
                    An error occurred while loading this page. Please try again.
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground/60 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}
                <Button onClick={reset} size="sm">
                    Try again
                </Button>
            </div>
        </div>
    );
}
