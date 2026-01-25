import type { EditorElement } from "@/lib/types/editor";

const applyStyles = (
  element: EditorElement,
  patch: Record<string, unknown>
): EditorElement => ({
  ...element,
  styles: {
    ...element.styles,
    ...patch,
  },
});

const normalizeElement = (
  element: EditorElement,
  parentType?: EditorElement["type"]
): EditorElement => {
  let next = element;
  const styles = element.styles || {};
  const stylePatch: Record<string, unknown> = {};

  if (element.name === "Nav Layout" && element.type === "container") {
    if (styles.flexWrap === undefined) stylePatch.flexWrap = "wrap";
    if (styles.alignItems === undefined) stylePatch.alignItems = "center";
    if (styles.justifyContent === undefined) stylePatch.justifyContent = "space-between";
    if (styles.gap === undefined) stylePatch.gap = "14px";
    if (styles.maxWidth === undefined) stylePatch.maxWidth = "1200px";
    if (styles.width === undefined) stylePatch.width = "100%";
    if (styles.marginLeft === undefined) stylePatch.marginLeft = "auto";
    if (styles.marginRight === undefined) stylePatch.marginRight = "auto";
  }

  if (element.name === "Brand" && element.type === "container") {
    if (styles.flex === undefined) stylePatch.flex = "1 1 220px";
    if (styles.minWidth === undefined) stylePatch.minWidth = "200px";
  }

  if (element.name === "Nav Links" && element.type === "container") {
    if (styles.flexWrap === undefined) stylePatch.flexWrap = "wrap";
    if (styles.flex === undefined) stylePatch.flex = "2 1 320px";
    if (styles.minWidth === undefined) stylePatch.minWidth = "240px";
  }

  if (element.name === "Nav Actions" && element.type === "container") {
    if (styles.flexWrap === undefined) stylePatch.flexWrap = "wrap";
    if (styles.flex === undefined) stylePatch.flex = "1 1 220px";
    if (styles.minWidth === undefined) stylePatch.minWidth = "200px";
    if (styles.marginLeft === undefined) stylePatch.marginLeft = "auto";
  }

  if (element.name === "Company Logo" && element.type === "image") {
    if (styles.width === "100%" || styles.width === undefined) {
      stylePatch.width = "140px";
    }
    if (styles.maxWidth === undefined) stylePatch.maxWidth = "100%";
    if (styles.objectFit === undefined) stylePatch.objectFit = "contain";
  }

  if (element.name === "Brand Name" && element.type === "text") {
    if (styles.fontSize === undefined) stylePatch.fontSize = "18px";
    if (styles.lineHeight === undefined) stylePatch.lineHeight = "1.1";
  }

  if (element.type === "link") {
    if (element.name === "Home") {
      if (styles.fontSize === undefined) stylePatch.fontSize = "14px";
      if (styles.padding === undefined) stylePatch.padding = "8px 20px";
      if (styles.borderRadius === undefined) stylePatch.borderRadius = "999px";
      if (styles.display === undefined) stylePatch.display = "inline-flex";
      if (styles.alignItems === undefined) stylePatch.alignItems = "center";
      if (styles.justifyContent === undefined) stylePatch.justifyContent = "center";
    }
    if (element.name === "Features" || element.name === "Pricing") {
      if (styles.fontSize === undefined) stylePatch.fontSize = "14px";
      if (styles.padding === undefined) stylePatch.padding = "8px 20px";
      if (styles.borderRadius === undefined) stylePatch.borderRadius = "999px";
      if (styles.display === undefined) stylePatch.display = "inline-flex";
      if (styles.alignItems === undefined) stylePatch.alignItems = "center";
      if (styles.justifyContent === undefined) stylePatch.justifyContent = "center";
    }
    if (element.name === "Login") {
      if (styles.fontSize === undefined) stylePatch.fontSize = "14px";
      if (styles.padding === undefined) stylePatch.padding = "10px 20px";
      if (styles.borderRadius === undefined) stylePatch.borderRadius = "999px";
      if (styles.display === undefined) stylePatch.display = "inline-flex";
      if (styles.alignItems === undefined) stylePatch.alignItems = "center";
      if (styles.justifyContent === undefined) stylePatch.justifyContent = "center";
    }
    if (element.name === "Get Started") {
      if (styles.fontSize === undefined) stylePatch.fontSize = "14px";
      if (styles.padding === undefined) stylePatch.padding = "12px 24px";
      if (styles.borderRadius === undefined) stylePatch.borderRadius = "999px";
      if (styles.display === undefined) stylePatch.display = "inline-flex";
      if (styles.alignItems === undefined) stylePatch.alignItems = "center";
      if (styles.justifyContent === undefined) stylePatch.justifyContent = "center";
      if (styles.whiteSpace === undefined) stylePatch.whiteSpace = "nowrap";
    }
  }

  if (element.type === "2Col" || element.type === "3Col") {
    if (styles.display === undefined) stylePatch.display = "flex";
    if (styles.flexWrap === undefined) stylePatch.flexWrap = "wrap";
    if (styles.gap === undefined) {
      stylePatch.gap = element.type === "2Col" ? "24px" : "20px";
    }
    if (styles.alignItems === undefined) stylePatch.alignItems = "stretch";
    if (styles.width === undefined) stylePatch.width = "100%";
  }

  if ((parentType === "2Col" || parentType === "3Col") && element.type === "container") {
    if (styles.flex === undefined) {
      stylePatch.flex = parentType === "2Col" ? "1 1 300px" : "1 1 220px";
    }
    if (styles.minWidth === undefined) {
      stylePatch.minWidth = parentType === "2Col" ? "240px" : "200px";
    }
    if (styles.width === undefined) stylePatch.width = "100%";
  }

  if (Object.keys(stylePatch).length > 0) {
    next = applyStyles(next, stylePatch);
  }

  if (Array.isArray(next.content)) {
    const normalizedChildren = next.content.map((child) =>
      normalizeElement(child, next.type)
    );
    if (normalizedChildren !== next.content) {
      next = {
        ...next,
        content: normalizedChildren,
      };
    }
  }

  return next;
};

export const normalizeEditorElements = (
  elements: EditorElement[]
): EditorElement[] => elements.map((element) => normalizeElement(element));
