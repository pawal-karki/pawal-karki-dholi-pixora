import { describe, expect, it } from "bun:test";
import { sumTicketValues } from "@/lib/pipeline-metrics";
import { reorderByIndex, assignSequentialOrder } from "@/lib/dnd-reorder";

type Lane = { id: string; name: string; order: number; tickets: Ticket[] };
type Ticket = { id: string; name: string; value: string | null; laneId: string };

function normalizePipelineTicketValue(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v);
  return s === "" ? null : s;
}

function computeLaneTotal(tickets: { value: string | null }[]): number {
  return sumTicketValues(tickets.map((t) => (t.value ? Number(t.value) : null)));
}

function sortLanesByOrder(lanes: Lane[]): Lane[] {
  return [...lanes].sort((a, b) => a.order - b.order);
}

function moveLane(lanes: Lane[], fromIdx: number, toIdx: number): Lane[] {
  const reordered = reorderByIndex(lanes, fromIdx, toIdx);
  return assignSequentialOrder(reordered);
}

function moveTicketBetweenLanes(
  sourceLane: Lane,
  destLane: Lane,
  ticketId: string,
): { sourceLane: Lane; destLane: Lane } {
  const ticket = sourceLane.tickets.find((t) => t.id === ticketId);
  if (!ticket) return { sourceLane, destLane };
  return {
    sourceLane: { ...sourceLane, tickets: sourceLane.tickets.filter((t) => t.id !== ticketId) },
    destLane: { ...destLane, tickets: [...destLane.tickets, { ...ticket, laneId: destLane.id }] },
  };
}

describe("Pipeline features", () => {
  describe("ticket value normalization", () => {
    it("null stays null", () => {
      expect(normalizePipelineTicketValue(null)).toBeNull();
    });
    it("undefined becomes null", () => {
      expect(normalizePipelineTicketValue(undefined)).toBeNull();
    });
    it("empty string becomes null", () => {
      expect(normalizePipelineTicketValue("")).toBeNull();
    });
    it("number is stringified", () => {
      expect(normalizePipelineTicketValue(1500)).toBe("1500");
    });
    it("string number passes through", () => {
      expect(normalizePipelineTicketValue("2500")).toBe("2500");
    });
    it("Decimal object is stringified", () => {
      expect(normalizePipelineTicketValue({ toString: () => "99.99" })).toBe("99.99");
    });
  });

  describe("lane totals aggregation", () => {
    it("sums all ticket values in a lane", () => {
      const tickets = [
        { value: "1000" },
        { value: "2500" },
        { value: "500" },
      ];
      expect(computeLaneTotal(tickets)).toBe(4000);
    });

    it("ignores null values", () => {
      const tickets = [{ value: "1000" }, { value: null }, { value: "500" }];
      expect(computeLaneTotal(tickets)).toBe(1500);
    });

    it("empty lane totals to 0", () => {
      expect(computeLaneTotal([])).toBe(0);
    });

    it("handles decimal values", () => {
      const tickets = [{ value: "99.50" }, { value: "0.50" }];
      expect(computeLaneTotal(tickets)).toBe(100);
    });
  });

  describe("lane ordering", () => {
    const lanes: Lane[] = [
      { id: "l1", name: "Lead", order: 0, tickets: [] },
      { id: "l2", name: "Qualified", order: 1, tickets: [] },
      { id: "l3", name: "Proposal", order: 2, tickets: [] },
      { id: "l4", name: "Won", order: 3, tickets: [] },
    ];

    it("sortLanesByOrder returns ascending order", () => {
      const shuffled = [lanes[2]!, lanes[0]!, lanes[3]!, lanes[1]!];
      const sorted = sortLanesByOrder(shuffled);
      expect(sorted.map((l) => l.id)).toEqual(["l1", "l2", "l3", "l4"]);
    });

    it("moveLane reorders and re-indexes", () => {
      const result = moveLane(lanes, 3, 0);
      expect(result.map((l) => l.id)).toEqual(["l4", "l1", "l2", "l3"]);
      expect(result.map((l) => l.order)).toEqual([0, 1, 2, 3]);
    });

    it("moveLane no-op preserves order", () => {
      const result = moveLane(lanes, 1, 1);
      expect(result.map((l) => l.id)).toEqual(["l1", "l2", "l3", "l4"]);
    });
  });

  describe("cross-lane ticket movement", () => {
    it("moves ticket from source to destination", () => {
      const src: Lane = {
        id: "l1", name: "Lead", order: 0,
        tickets: [
          { id: "t1", name: "Deal A", value: "1000", laneId: "l1" },
          { id: "t2", name: "Deal B", value: "500", laneId: "l1" },
        ],
      };
      const dest: Lane = {
        id: "l2", name: "Won", order: 1, tickets: [],
      };

      const result = moveTicketBetweenLanes(src, dest, "t1");
      expect(result.sourceLane.tickets).toHaveLength(1);
      expect(result.sourceLane.tickets[0]!.id).toBe("t2");
      expect(result.destLane.tickets).toHaveLength(1);
      expect(result.destLane.tickets[0]!.id).toBe("t1");
      expect(result.destLane.tickets[0]!.laneId).toBe("l2");
    });

    it("no-op when ticket not found", () => {
      const src: Lane = { id: "l1", name: "Lead", order: 0, tickets: [] };
      const dest: Lane = { id: "l2", name: "Won", order: 1, tickets: [] };
      const result = moveTicketBetweenLanes(src, dest, "nonexistent");
      expect(result.sourceLane.tickets).toHaveLength(0);
      expect(result.destLane.tickets).toHaveLength(0);
    });
  });
});
