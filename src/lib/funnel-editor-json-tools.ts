import type { EditorElement } from "@/lib/types/editor";

const DEFAULT_BODY: EditorElement = {
  content: [],
  id: "__body",
  name: "Body",
  styles: { backgroundColor: "white" },
  type: "__body",
};

/** Parse funnel page `content` JSON (same rules as editor / unit tests). */
export function parseEditorPageContent(content: string | null): EditorElement[] {
  if (!content) return [{ ...DEFAULT_BODY, content: [] }];
  try {
    const parsed = JSON.parse(content) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [{ ...DEFAULT_BODY, content: [] }];
    }
    return parsed as EditorElement[];
  } catch {
    return [{ ...DEFAULT_BODY, content: [] }];
  }
}

export function defaultEditorBody(): EditorElement {
  return { ...DEFAULT_BODY, content: [] };
}

export function findEditorElementById(
  elements: EditorElement[],
  id: string
): EditorElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if (Array.isArray(el.content)) {
      const found = findEditorElementById(el.content, id);
      if (found) return found;
    }
  }
  return null;
}

export function countEditorElements(elements: EditorElement[]): number {
  let count = 0;
  for (const el of elements) {
    count++;
    if (Array.isArray(el.content)) count += countEditorElements(el.content);
  }
  return count;
}
