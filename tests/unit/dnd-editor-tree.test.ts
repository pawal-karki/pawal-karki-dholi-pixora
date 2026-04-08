import { describe, expect, it } from "bun:test";
import { reorderByIndex, assignSequentialOrder } from "@/lib/dnd-reorder";

type EditorElement = {
  id: string;
  name: string;
  type: string;
  styles: Record<string, unknown>;
  content: EditorElement[] | Record<string, unknown>;
  order?: number;
};

function findElement(elements: EditorElement[], id: string): EditorElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if (Array.isArray(el.content)) {
      const found = findElement(el.content, id);
      if (found) return found;
    }
  }
  return null;
}

function removeElement(elements: EditorElement[], id: string): EditorElement[] {
  return elements
    .filter((el) => el.id !== id)
    .map((el) => ({
      ...el,
      content: Array.isArray(el.content) ? removeElement(el.content, id) : el.content,
    }));
}

function insertAtIndex(
  elements: EditorElement[],
  containerId: string,
  el: EditorElement,
  index: number,
): EditorElement[] {
  return elements.map((e) => {
    if (e.id === containerId && Array.isArray(e.content)) {
      const copy = [...e.content];
      copy.splice(Math.min(index, copy.length), 0, el);
      return { ...e, content: copy };
    }
    if (Array.isArray(e.content)) {
      return { ...e, content: insertAtIndex(e.content, containerId, el, index) };
    }
    return e;
  });
}

function moveElement(
  elements: EditorElement[],
  elementId: string,
  newContainerId: string,
  index: number,
): EditorElement[] {
  if (elementId === "__body" || elementId === newContainerId) return elements;
  const moving = findElement(elements, elementId);
  if (!moving) return elements;
  const afterRemove = removeElement(elements, elementId);
  return insertAtIndex(afterRemove, newContainerId, moving, index);
}

function flattenElements(elements: EditorElement[]): string[] {
  const ids: string[] = [];
  for (const el of elements) {
    ids.push(el.id);
    if (Array.isArray(el.content)) ids.push(...flattenElements(el.content));
  }
  return ids;
}

describe("Drag and drop editor tree operations", () => {
  const mkText = (id: string, text: string): EditorElement => ({
    id, name: text, type: "text", styles: {}, content: { innerText: text },
  });

  const mkSection = (id: string, name: string, children: EditorElement[]): EditorElement => ({
    id, name, type: "section", styles: {}, content: children,
  });

  const mkBody = (...children: EditorElement[]): EditorElement[] => [{
    id: "__body", name: "Body", type: "__body", styles: {},
    content: children,
  }];

  describe("within-container reorder via reorderByIndex", () => {
    it("move first child to last position", () => {
      const children = [mkText("a", "A"), mkText("b", "B"), mkText("c", "C")];
      const reordered = reorderByIndex(children, 0, 2);
      expect(reordered.map((c) => c.id)).toEqual(["b", "c", "a"]);
    });

    it("move last child to first position", () => {
      const children = [mkText("a", "A"), mkText("b", "B"), mkText("c", "C")];
      const reordered = reorderByIndex(children, 2, 0);
      expect(reordered.map((c) => c.id)).toEqual(["c", "a", "b"]);
    });

    it("swap adjacent items", () => {
      const children = [mkText("a", "A"), mkText("b", "B")];
      const reordered = reorderByIndex(children, 0, 1);
      expect(reordered.map((c) => c.id)).toEqual(["b", "a"]);
    });

    it("preserves element data during reorder", () => {
      const children = [
        { ...mkText("a", "A"), styles: { color: "red" } },
        mkText("b", "B"),
      ];
      const reordered = reorderByIndex(children, 0, 1);
      expect(reordered[1]!.styles).toEqual({ color: "red" });
    });
  });

  describe("cross-container element move", () => {
    it("moves text from section A to section B", () => {
      const tree = mkBody(
        mkSection("s1", "Section 1", [mkText("t1", "Hello"), mkText("t2", "World")]),
        mkSection("s2", "Section 2", []),
      );

      const updated = moveElement(tree, "t1", "s2", 0);
      const s1 = findElement(updated, "s1")!;
      const s2 = findElement(updated, "s2")!;
      expect((s1.content as EditorElement[]).map((c) => c.id)).toEqual(["t2"]);
      expect((s2.content as EditorElement[]).map((c) => c.id)).toEqual(["t1"]);
    });

    it("moves section from body to another section", () => {
      const innerSection = mkSection("inner", "Inner", [mkText("t", "text")]);
      const outerSection = mkSection("outer", "Outer", []);
      const tree = mkBody(innerSection, outerSection);

      const updated = moveElement(tree, "inner", "outer", 0);
      const body = updated[0]!;
      expect((body.content as EditorElement[]).map((c) => c.id)).toEqual(["outer"]);
      const outer = findElement(updated, "outer")!;
      expect((outer.content as EditorElement[]).map((c) => c.id)).toEqual(["inner"]);
    });

    it("inserts at specific index in destination", () => {
      const tree = mkBody(
        mkSection("s1", "S1", [mkText("t1", "Hello")]),
        mkSection("s2", "S2", [mkText("x1", "A"), mkText("x2", "B")]),
      );

      const updated = moveElement(tree, "t1", "s2", 1);
      const s2 = findElement(updated, "s2")!;
      expect((s2.content as EditorElement[]).map((c) => c.id)).toEqual(["x1", "t1", "x2"]);
    });

    it("move to body root level", () => {
      const tree = mkBody(
        mkSection("s1", "S1", [mkText("t1", "Deep text")]),
      );

      const updated = moveElement(tree, "t1", "__body", 1);
      const body = updated[0]!;
      const children = body.content as EditorElement[];
      expect(children).toHaveLength(2);
      expect(children[1]!.id).toBe("t1");
    });
  });

  describe("move safety guards", () => {
    it("__body cannot be moved", () => {
      const tree = mkBody(mkText("t1", "text"));
      const updated = moveElement(tree, "__body", "t1", 0);
      expect(updated).toEqual(tree);
    });

    it("moving element into itself is no-op", () => {
      const tree = mkBody(mkSection("s1", "S1", [mkText("t1", "text")]));
      const updated = moveElement(tree, "s1", "s1", 0);
      expect(updated).toEqual(tree);
    });

    it("moving nonexistent element is no-op", () => {
      const tree = mkBody(mkText("t1", "text"));
      const updated = moveElement(tree, "nope", "__body", 0);
      expect(flattenElements(updated)).toEqual(flattenElements(tree));
    });
  });

  describe("funnel page reorder with sequential order", () => {
    type FunnelPage = { id: string; name: string; order: number };
    const pages: FunnelPage[] = [
      { id: "p1", name: "Landing", order: 0 },
      { id: "p2", name: "Pricing", order: 1 },
      { id: "p3", name: "Checkout", order: 2 },
      { id: "p4", name: "Thank You", order: 3 },
    ];

    it("drag page 4 to position 1 and re-index", () => {
      const reordered = reorderByIndex(pages, 3, 0);
      const indexed = assignSequentialOrder(reordered);
      expect(indexed.map((p) => p.id)).toEqual(["p4", "p1", "p2", "p3"]);
      expect(indexed.map((p) => p.order)).toEqual([0, 1, 2, 3]);
    });

    it("drag page 1 to position 3 and re-index", () => {
      const reordered = reorderByIndex(pages, 0, 2);
      const indexed = assignSequentialOrder(reordered);
      expect(indexed.map((p) => p.id)).toEqual(["p2", "p3", "p1", "p4"]);
      expect(indexed.map((p) => p.order)).toEqual([0, 1, 2, 3]);
    });

    it("no-op reorder preserves order", () => {
      const reordered = reorderByIndex(pages, 2, 2);
      const indexed = assignSequentialOrder(reordered);
      expect(indexed.map((p) => p.id)).toEqual(["p1", "p2", "p3", "p4"]);
    });

    it("two pages swap correctly", () => {
      const twoPages = [pages[0]!, pages[1]!];
      const reordered = reorderByIndex(twoPages, 0, 1);
      expect(reordered.map((p) => p.id)).toEqual(["p2", "p1"]);
    });
  });

  describe("flatten and count helpers", () => {
    it("flattenElements returns all IDs depth-first", () => {
      const tree = mkBody(
        mkSection("s1", "S1", [mkText("t1", "A"), mkText("t2", "B")]),
        mkText("t3", "C"),
      );
      expect(flattenElements(tree)).toEqual(["__body", "s1", "t1", "t2", "t3"]);
    });

    it("empty body has single ID", () => {
      expect(flattenElements(mkBody())).toEqual(["__body"]);
    });
  });
});
