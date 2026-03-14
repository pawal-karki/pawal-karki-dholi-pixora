/** Sum numeric ticket values for pipeline / dashboard rollups (mirrors Prisma Decimal as numbers in tests). */
export function sumTicketValues(
  values: (number | null | undefined)[],
): number {
  return values.reduce((sum, v) => {
    if (v == null || Number.isNaN(v)) return sum;
    return sum + v;
  }, 0);
}
