import { describe, expect, test } from "bun:test";

import { reorderByIndex, assignSequentialOrder } from "@/lib/dnd-reorder";

type FunnelPage = { id: string; name: string; order: number };

/**
 * Feature: Drag-and-drop reorder — comprehensive edge cases for funnel step ordering.
 */
describe("Drag & drop — advanced", () => {
  const pages: FunnelPage[] = [
    { id: "a", name: "Landing", order: 0 },
    { id: "b", name: "Pricing", order: 1 },
    { id: "c", name: "Checkout", order: 2 },
    { id: "d", name: "Thank You", order: 3 },
  ];

  test("move last to first", () => {
    const next = reorderByIndex(pages, 3, 0);
    expect(next.map((p) => p.id)).toEqual(["d", "a", "b", "c"]);
  });

  test("no-op when from === to", () => {
    const next = reorderByIndex(pages, 1, 1);
    expect(next.map((p) => p.id)).toEqual(["a", "b", "c", "d"]);
  });

  test("move middle item down one", () => {
    const next = reorderByIndex(pages, 1, 2);
    expect(next.map((p) => p.id)).toEqual(["a", "c", "b", "d"]);
  });

  test("single item list is unchanged", () => {
    expect(reorderByIndex([{ id: "x" }], 0, 0)).toEqual([{ id: "x" }]);
  });

  test("assignSequentialOrder re-indexes correctly after reorder", () => {
    const reordered = reorderByIndex(pages, 3, 0);
    const indexed = assignSequentialOrder(reordered);
    expect(indexed.map((p) => p.order)).toEqual([0, 1, 2, 3]);
    expect(indexed[0]!.id).toBe("d");
    expect(indexed[0]!.order).toBe(0);
  });

  test("original array is not mutated", () => {
    const copy = [...pages];
    reorderByIndex(pages, 0, 3);
    expect(pages).toEqual(copy);
  });
});
