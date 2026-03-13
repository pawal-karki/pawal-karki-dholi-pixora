/**
 * Immutable reorder used by funnel step drag-and-drop (same semantics as splice in funnel-steps).
 */
export function reorderByIndex<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex < 0 || fromIndex >= items.length) return [...items];
  if (toIndex < 0 || toIndex >= items.length) return [...items];
  const next = [...items];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

/**
 * Apply contiguous order indices (0..n-1) to funnel-like records for persistence payloads.
 */
export function assignSequentialOrder<T extends { order?: number }>(
  pages: T[],
): (T & { order: number })[] {
  return pages.map((page, index) => ({ ...page, order: index }));
}
