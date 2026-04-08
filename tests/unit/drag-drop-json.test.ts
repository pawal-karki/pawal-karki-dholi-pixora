import { describe, expect, it } from "bun:test";

import { assignSequentialOrder, reorderByIndex } from "@/lib/dnd-reorder";

type Block = { id: string; type: string; props: Record<string, unknown> };

type FunnelPage = { id: string; name: string; order: number };

describe("dnd-reorder", () => {
  const pages: FunnelPage[] = [
    { id: "a", name: "Landing", order: 0 },
    { id: "b", name: "Pricing", order: 1 },
    { id: "c", name: "Checkout", order: 2 },
    { id: "d", name: "Thank You", order: 3 },
  ];

  describe("reorderByIndex", () => {
    it("moves item and preserves object identity for moved slot", () => {
      const a: Block = { id: "1", type: "hero", props: { title: "A" } };
      const b: Block = { id: "2", type: "cta", props: {} };
      const c: Block = { id: "3", type: "footer", props: {} };
      const next = reorderByIndex([a, b, c], 2, 0);
      expect(next[0]).toBe(c);
      expect(next.map((x) => x.id)).toEqual(["3", "1", "2"]);
    });

    it("returns shallow copy unchanged for out-of-range fromIndex", () => {
      const list = [1, 2, 3];
      expect(reorderByIndex(list, -1, 1)).toEqual([1, 2, 3]);
      expect(reorderByIndex(list, 9, 0)).toEqual([1, 2, 3]);
    });

    it("returns shallow copy unchanged for out-of-range toIndex", () => {
      const list = [1, 2, 3];
      expect(reorderByIndex(list, 0, 9)).toEqual([1, 2, 3]);
    });

    it("moves last item to first", () => {
      const next = reorderByIndex(pages, 3, 0);
      expect(next.map((p) => p.id)).toEqual(["d", "a", "b", "c"]);
    });

    it("no-ops when fromIndex equals toIndex", () => {
      const next = reorderByIndex(pages, 1, 1);
      expect(next.map((p) => p.id)).toEqual(["a", "b", "c", "d"]);
    });

    it("moves middle item down one position", () => {
      const next = reorderByIndex(pages, 1, 2);
      expect(next.map((p) => p.id)).toEqual(["a", "c", "b", "d"]);
    });

    it("single-element list unchanged for valid indices", () => {
      expect(reorderByIndex([{ id: "x" }], 0, 0)).toEqual([{ id: "x" }]);
    });

    it("does not mutate the source array", () => {
      const copy = [...pages];
      reorderByIndex(pages, 0, 3);
      expect(pages).toEqual(copy);
    });
  });

  describe("assignSequentialOrder", () => {
    it("reindexes order 0..n-1 after reorder", () => {
      const reordered = reorderByIndex(pages, 3, 0);
      const indexed = assignSequentialOrder(reordered);
      expect(indexed.map((p) => p.order)).toEqual([0, 1, 2, 3]);
      expect(indexed[0]!.id).toBe("d");
      expect(indexed[0]!.order).toBe(0);
    });

    it("returns new objects with spread order field", () => {
      const input = [{ id: "only", order: 99 }];
      const out = assignSequentialOrder(input);
      expect(out[0]!.order).toBe(0);
      expect(input[0]!.order).toBe(99);
    });
  });
});
