/**
 * Whether assigning a ticket should trigger notification / email side-effects.
 */
export function isNewTicketAssignment(
  previousAssigneeId: string | null | undefined,
  nextAssigneeId: string | null | undefined,
): boolean {
  return !!nextAssigneeId && nextAssigneeId !== previousAssigneeId;
}
