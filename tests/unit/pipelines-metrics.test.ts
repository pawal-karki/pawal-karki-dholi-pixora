import { describe, expect, it } from "bun:test";

import { sumTicketValues } from "@/lib/pipeline-metrics";

/**
 * Feature: Pipelines — numeric rollups used for opportunity value displays.
 */
describe("Pipelines", () => {
  describe("ticket value aggregation", () => {
    it("sums positive amounts", () => {
      expect(sumTicketValues([100, 200, 50])).toBe(350);
    });

    it("ignores null and undefined", () => {
      expect(sumTicketValues([100, null, undefined, 25])).toBe(125);
    });

    it("sums empty array to 0", () => {
      expect(sumTicketValues([])).toBe(0);
    });

    it("includes numeric zero in sum", () => {
      expect(sumTicketValues([0])).toBe(0);
    });

    it("ignores NaN entries", () => {
      expect(sumTicketValues([10, Number.NaN, 5])).toBe(15);
    });
  });
});
