import { describe, expect, it } from "bun:test";

import {
  assignSequentialOrder,
  reorderByIndex,
} from "@/lib/dnd-reorder";
import {
  buildPublishedFunnelPageUrl,
  normalizeScheme,
} from "@/lib/funnel-url";

/**
 * Feature: Funnel steps — ordering and public URLs.
 */
describe("Funnel steps", () => {
  describe("published URL builder", () => {
    it("builds https URL with clean path", () => {
      const url = buildPublishedFunnelPageUrl({
        subDomainName: "sale",
        pathName: "/checkout",
        scheme: "https",
        domain: "example.com",
      });
      expect(url).toBe("https://sale.example.com/checkout");
    });

    it("normalizes scheme with colon", () => {
      expect(normalizeScheme("https:")).toBe("https");
    });
  });

  describe("step reorder (drag end)", () => {
    it("moves first item to end", () => {
      const pages = [{ id: "a" }, { id: "b" }, { id: "c" }];
      const next = reorderByIndex(pages, 0, 2);
      expect(next.map((p) => p.id)).toEqual(["b", "c", "a"]);
    });

    it("assignSequentialOrder sets 0..n-1", () => {
      const ordered = assignSequentialOrder([
        { name: "x", order: 99 },
        { name: "y" },
      ]);
      expect(ordered.map((p) => p.order)).toEqual([0, 1]);
    });
  });
});
