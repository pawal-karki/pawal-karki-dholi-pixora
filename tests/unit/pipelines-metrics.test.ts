import { describe, expect, test } from "bun:test";

import { sumTicketValues } from "@/lib/pipeline-metrics";

/**
 * Feature: Pipelines — numeric rollups used for opportunity value displays.
 */
describe("Pipelines", () => {
  describe("ticket value aggregation", () => {
    test("sums positive amounts", () => {
      expect(sumTicketValues([100, 200, 50])).toBe(350);
    });

    test("ignores null and undefined", () => {
      expect(sumTicketValues([100, null, undefined, 25])).toBe(125);
    });

    test.each([
      [[], 0],
      [[0], 0],
    ] as const)("sumTicketValues(%p) === %p", (input, expected) => {
      expect(sumTicketValues([...input])).toBe(expected);
    });
  });
});
