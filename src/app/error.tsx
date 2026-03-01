"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    React.useEffect(() => {
        console.error("[global-error]", error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                    <div className="text-center space-y-4 p-8 max-w-md">
                        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
                        <h1 className="text-2xl font-bold">Something went wrong</h1>
                        <p className="text-muted-foreground text-sm">
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        {error.digest && (
                            <p className="text-xs text-muted-foreground/60 font-mono">
                                Error ID: {error.digest}
                            </p>
                        )}
                        <button
                            onClick={reset}
                            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
