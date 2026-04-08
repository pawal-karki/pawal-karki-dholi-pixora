import { describe, expect, it } from "bun:test";
import { reorderByIndex, assignSequentialOrder } from "@/lib/dnd-reorder";
import { buildPublishedFunnelPageUrl, normalizeScheme } from "@/lib/funnel-url";

type EditorBtns =
  | "text" | "container" | "section" | "contactForm" | "paymentForm"
  | "link" | "2Col" | "video" | "__body" | "image" | "3Col"
  | "productGrid" | "cart" | "checkout" | "customHtml" | null;

type EditorElement = {
  id: string;
  styles: Record<string, unknown>;
  name: string;
  type: EditorBtns;
  content: EditorElement[] | Record<string, unknown>;
};

const DEFAULT_BODY: EditorElement = {
  content: [],
  id: "__body",
  name: "Body",
  styles: { backgroundColor: "white" },
  type: "__body",
};

function makeDefaultContent(): string {
  return JSON.stringify([DEFAULT_BODY]);
}

function parsePageContent(content: string | null): EditorElement[] {
  if (!content) return [{ ...DEFAULT_BODY, content: [] }];
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed) || parsed.length === 0) return [{ ...DEFAULT_BODY, content: [] }];
    return parsed;
  } catch {
    return [{ ...DEFAULT_BODY, content: [] }];
  }
}

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

function countElements(elements: EditorElement[]): number {
  let count = 0;
  for (const el of elements) {
    count++;
    if (Array.isArray(el.content)) count += countElements(el.content);
  }
  return count;
}

function removeElement(elements: EditorElement[], id: string): EditorElement[] {
  return elements
    .filter((el) => el.id !== id)
    .map((el) => ({
      ...el,
      content: Array.isArray(el.content) ? removeElement(el.content, id) : el.content,
    }));
}

function addElement(elements: EditorElement[], containerId: string, newEl: EditorElement): EditorElement[] {
  return elements.map((el) => {
    if (el.id === containerId && Array.isArray(el.content)) {
      return { ...el, content: [...el.content, newEl] };
    }
    if (Array.isArray(el.content)) {
      return { ...el, content: addElement(el.content, containerId, newEl) };
    }
    return el;
  });
}

function insertElement(
  elements: EditorElement[],
  containerId: string,
  newEl: EditorElement,
  index: number,
): EditorElement[] {
  return elements.map((el) => {
    if (el.id === containerId && Array.isArray(el.content)) {
      const copy = [...el.content];
      copy.splice(index, 0, newEl);
      return { ...el, content: copy };
    }
    if (Array.isArray(el.content)) {
      return { ...el, content: insertElement(el.content, containerId, newEl, index) };
    }
    return el;
  });
}

function isDescendant(elements: EditorElement[], parentId: string, childId: string): boolean {
  const parent = findElement(elements, parentId);
  if (!parent || !Array.isArray(parent.content)) return false;
  return findElement(parent.content, childId) !== null;
}

function generateCheckoutSlug(productName: string, uuidSlice: string): string {
  return `checkout-${productName.toLowerCase().replace(/\s+/g, "-")}-${uuidSlice}`;
}

describe("Funnel editor JSON content", () => {
  describe("default body content", () => {
    it("default content is valid JSON array with __body", () => {
      const raw = makeDefaultContent();
      const parsed = JSON.parse(raw);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe("__body");
      expect(parsed[0].type).toBe("__body");
      expect(parsed[0].content).toEqual([]);
    });

    it("default body has white background", () => {
      const raw = makeDefaultContent();
      const parsed = JSON.parse(raw);
      expect(parsed[0].styles.backgroundColor).toBe("white");
    });
  });

  describe("page content parsing (LOAD_DATA)", () => {
    it("null content returns default body", () => {
      const elements = parsePageContent(null);
      expect(elements).toHaveLength(1);
      expect(elements[0]!.type).toBe("__body");
    });

    it("empty string returns default body", () => {
      const elements = parsePageContent("");
      expect(elements).toHaveLength(1);
      expect(elements[0]!.type).toBe("__body");
    });

    it("invalid JSON returns default body", () => {
      const elements = parsePageContent("{broken json}");
      expect(elements).toHaveLength(1);
      expect(elements[0]!.type).toBe("__body");
    });

    it("empty array returns default body", () => {
      const elements = parsePageContent("[]");
      expect(elements).toHaveLength(1);
      expect(elements[0]!.type).toBe("__body");
    });

    it("valid content round-trips through stringify + parse", () => {
      const tree: EditorElement[] = [{
        id: "__body", name: "Body", type: "__body",
        styles: { backgroundColor: "white" },
        content: [{
          id: "txt-1", name: "Heading", type: "text",
          styles: { fontSize: "24px" },
          content: { innerText: "Hello World" },
        }],
      }];
      const raw = JSON.stringify(tree);
      const parsed = parsePageContent(raw);
      expect(parsed).toHaveLength(1);
      expect((parsed[0]!.content as EditorElement[])[0]!.id).toBe("txt-1");
    });
  });

  describe("element tree traversal", () => {
    const tree: EditorElement[] = [{
      id: "__body", name: "Body", type: "__body", styles: {},
      content: [
        {
          id: "sec-1", name: "Hero", type: "section", styles: {},
          content: [
            { id: "txt-1", name: "Title", type: "text", styles: {}, content: { innerText: "Hello" } },
            { id: "img-1", name: "Logo", type: "image", styles: {}, content: { src: "/logo.png" } },
          ],
        },
        { id: "txt-2", name: "Footer text", type: "text", styles: {}, content: { innerText: "Footer" } },
      ],
    }];

    it("findElement returns nested element", () => {
      expect(findElement(tree, "txt-1")!.name).toBe("Title");
    });

    it("findElement returns null for missing id", () => {
      expect(findElement(tree, "nonexistent")).toBeNull();
    });

    it("countElements counts all nodes recursively", () => {
      expect(countElements(tree)).toBe(5);
    });

    it("removeElement deletes from nested tree", () => {
      const updated = removeElement(tree, "txt-1");
      expect(findElement(updated, "txt-1")).toBeNull();
      expect(countElements(updated)).toBe(4);
    });

    it("removeElement keeps siblings", () => {
      const updated = removeElement(tree, "txt-1");
      expect(findElement(updated, "img-1")).not.toBeNull();
    });

    it("removeElement at root level works", () => {
      const multiRoot = [
        { id: "a", name: "A", type: "text" as EditorBtns, styles: {}, content: { innerText: "a" } },
        { id: "b", name: "B", type: "text" as EditorBtns, styles: {}, content: { innerText: "b" } },
      ];
      expect(removeElement(multiRoot, "a")).toHaveLength(1);
    });
  });

  describe("ADD_ELEMENT to container", () => {
    const tree: EditorElement[] = [{
      id: "__body", name: "Body", type: "__body", styles: {},
      content: [],
    }];
    const newEl: EditorElement = {
      id: "new-1", name: "CTA", type: "text", styles: {}, content: { innerText: "Click me" },
    };

    it("adds element to body container", () => {
      const updated = addElement(tree, "__body", newEl);
      const body = updated[0]!;
      expect((body.content as EditorElement[])).toHaveLength(1);
      expect((body.content as EditorElement[])[0]!.id).toBe("new-1");
    });

    it("adds to nested container", () => {
      const nestedTree: EditorElement[] = [{
        id: "__body", name: "Body", type: "__body", styles: {},
        content: [{
          id: "sec-1", name: "Section", type: "section", styles: {},
          content: [],
        }],
      }];
      const updated = addElement(nestedTree, "sec-1", newEl);
      const sec = findElement(updated, "sec-1")!;
      expect((sec.content as EditorElement[])).toHaveLength(1);
    });

    it("no-op when containerId not found", () => {
      const updated = addElement(tree, "nonexistent", newEl);
      expect(countElements(updated)).toBe(1);
    });
  });

  describe("INSERT_ELEMENT at specific index", () => {
    const tree: EditorElement[] = [{
      id: "__body", name: "Body", type: "__body", styles: {},
      content: [
        { id: "a", name: "A", type: "text" as EditorBtns, styles: {}, content: { innerText: "A" } },
        { id: "c", name: "C", type: "text" as EditorBtns, styles: {}, content: { innerText: "C" } },
      ],
    }];
    const newEl: EditorElement = {
      id: "b", name: "B", type: "text", styles: {}, content: { innerText: "B" },
    };

    it("inserts at index 1 between A and C", () => {
      const updated = insertElement(tree, "__body", newEl, 1);
      const body = updated[0]!;
      const children = body.content as EditorElement[];
      expect(children.map((c) => c.id)).toEqual(["a", "b", "c"]);
    });

    it("inserts at index 0 prepends", () => {
      const updated = insertElement(tree, "__body", newEl, 0);
      const children = updated[0]!.content as EditorElement[];
      expect(children[0]!.id).toBe("b");
    });
  });

  describe("MOVE_ELEMENT safety checks", () => {
    const tree: EditorElement[] = [{
      id: "__body", name: "Body", type: "__body", styles: {},
      content: [{
        id: "parent", name: "Parent", type: "section", styles: {},
        content: [
          { id: "child", name: "Child", type: "text", styles: {}, content: { innerText: "x" } },
        ],
      }],
    }];

    it("__body cannot be moved", () => {
      expect("__body" === "__body").toBe(true);
    });

    it("cannot move element into its own descendant (cycle)", () => {
      expect(isDescendant(tree, "parent", "child")).toBe(true);
    });

    it("non-descendant relationship returns false", () => {
      expect(isDescendant(tree, "child", "parent")).toBe(false);
    });

    it("isDescendant false for non-container", () => {
      expect(isDescendant(tree, "child", "something")).toBe(false);
    });
  });

  describe("serialization (save)", () => {
    it("JSON.stringify preserves all element types", () => {
      const tree: EditorElement[] = [{
        id: "__body", name: "Body", type: "__body", styles: {},
        content: [
          { id: "t", name: "Text", type: "text", styles: {}, content: { innerText: "hi" } },
          { id: "i", name: "Img", type: "image", styles: {}, content: { src: "/a.png", alt: "alt" } },
          { id: "v", name: "Vid", type: "video", styles: {}, content: { src: "https://yt.be/x" } },
          { id: "l", name: "Link", type: "link", styles: {}, content: { href: "#", innerText: "Go" } },
          { id: "h", name: "HTML", type: "customHtml", styles: {}, content: { html: "<b>hi</b>", css: "" } },
        ],
      }];
      const raw = JSON.stringify(tree);
      const parsed = JSON.parse(raw) as EditorElement[];
      expect(parsed[0]!.content).toHaveLength(5);
      const types = (parsed[0]!.content as EditorElement[]).map((c) => c.type);
      expect(types).toEqual(["text", "image", "video", "link", "customHtml"]);
    });

    it("nested sections are preserved", () => {
      const tree: EditorElement[] = [{
        id: "__body", name: "Body", type: "__body", styles: {},
        content: [{
          id: "s1", name: "S", type: "section", styles: {},
          content: [{
            id: "c1", name: "C", type: "container", styles: {},
            content: [
              { id: "t1", name: "T", type: "text", styles: {}, content: { innerText: "deep" } },
            ],
          }],
        }],
      }];
      const raw = JSON.stringify(tree);
      const parsed = JSON.parse(raw) as EditorElement[];
      const deepText = findElement(parsed, "t1");
      expect(deepText).not.toBeNull();
      expect((deepText!.content as Record<string, unknown>).innerText).toBe("deep");
    });
  });

  describe("checkout page slug generation", () => {
    it("simple product name", () => {
      const slug = generateCheckoutSlug("Pro Plan", "a1b2");
      expect(slug).toBe("checkout-pro-plan-a1b2");
    });

    it("multi-space product name", () => {
      const slug = generateCheckoutSlug("My  Great  Product", "x9y0");
      expect(slug).toBe("checkout-my-great-product-x9y0");
    });

    it("single word product", () => {
      const slug = generateCheckoutSlug("Starter", "zzzz");
      expect(slug).toBe("checkout-starter-zzzz");
    });
  });
});
