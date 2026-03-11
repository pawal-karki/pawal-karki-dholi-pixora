/** Matches dashboard notification storage: `Actor | description`. */
export function formatActivityNotification(
  actorName: string,
  description: string,
): string {
  return `${actorName} | ${description}`;
}
