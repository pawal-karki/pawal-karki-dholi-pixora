import { describe, expect, test } from "bun:test";

import { reorderByIndex } from "@/lib/dnd-reorder";

type Block = { id: string; type: string; props: Record<string, unknown> };

/**
 * Feature: Drag-and-drop ordering for JSON-like editor payloads (funnel page lists).
 */
describe("Drag & drop JSON payloads", () => {
  test("reorder preserves object identity except moved index", () => {
    const a: Block = { id: "1", type: "hero", props: { title: "A" } };
    const b: Block = { id: "2", type: "cta", props: {} };
    const c: Block = { id: "3", type: "footer", props: {} };
    const next = reorderByIndex([a, b, c], 2, 0);
    expect(next[0]).toBe(c);
    expect(next.map((x) => x.id)).toEqual(["3", "1", "2"]);
  });

  test("out-of-range indices return shallow copy unchanged", () => {
    const list = [1, 2, 3];
    expect(reorderByIndex(list, 0, 9)).toEqual([1, 2, 3]);
    expect(reorderByIndex(list, -1, 1)).toEqual([1, 2, 3]);
  });
});
