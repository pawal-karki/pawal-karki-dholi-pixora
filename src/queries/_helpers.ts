/**
 * Shared type guards and interfaces for query files.
 * NOT a server action file — no "use server" directive.
 */

export interface ClerkError {
    status?: number;
    clerkError?: boolean;
    message?: string;
}

export function isClerkError(error: unknown): error is ClerkError {
    return (
        typeof error === "object" &&
        error !== null &&
        ("status" in error || "clerkError" in error || "message" in error)
    );
}
