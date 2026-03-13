/**
 * Shared AI route error classification (unit-tested, used by /api/chat/ai).
 */
export function isAiRateLimitedError(err: {
  status?: number;
  statusCode?: number;
  message?: string;
}): boolean {
  const status = err.status ?? err.statusCode;
  const msg = err.message ?? "";
  return (
    status === 429 ||
    msg.includes("429") ||
    msg.includes("Too Many Requests") ||
    msg.includes("quota")
  );
}

export function isAiAuthError(err: {
  status?: number;
  statusCode?: number;
  message?: string;
}): boolean {
  const status = err.status ?? err.statusCode;
  const msg = err.message ?? "";
  return (
    status === 401 ||
    status === 403 ||
    msg.includes("API key") ||
    msg.includes("Unauthorized") ||
    msg.includes("invalid")
  );
}

export function isAiModelNotFoundError(err: { message?: string }): boolean {
  const msg = err.message ?? "";
  return (
    msg.includes("model") &&
    (msg.includes("not found") || msg.includes("does not exist"))
  );
}
