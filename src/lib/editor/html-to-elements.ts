import { v4 as uuidv4 } from "uuid";
import type { EditorElement, EditorBtns } from "@/lib/types/editor";

const INLINE_TAGS = new Set([
    "a", "span", "strong", "b", "em", "i", "u", "small", "sub", "sup",
    "abbr", "code", "kbd", "mark", "s", "del", "ins", "br",
]);
const SECTION_TAGS = new Set(["section", "header", "footer", "main", "article", "aside", "nav"]);
const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "label", "li"]);
const LINK_TAGS = new Set(["a"]);
const IMAGE_TAGS = new Set(["img"]);
const VIDEO_TAGS = new Set(["video", "iframe"]);

function parseCssText(cssText: string): React.CSSProperties {
    const style: Record<string, string> = {};
    cssText.split(";").forEach((rule) => {
        const [prop, ...valParts] = rule.split(":");
        if (!prop || valParts.length === 0) return;
        const cssProp = prop.trim();
        const value = valParts.join(":").trim();
        if (!cssProp || !value) return;
        const jsProp = cssProp.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        style[jsProp] = value;
    });
    return style as React.CSSProperties;
}

function parseCssRules(css: string): Map<string, React.CSSProperties> {
    const map = new Map<string, React.CSSProperties>();
    const ruleRegex = /([^{}]+)\{([^}]*)\}/g;
    let match: RegExpExecArray | null;
    while ((match = ruleRegex.exec(css)) !== null) {
        const selectors = match[1].trim().split(",").map((s) => s.trim());
        const props = parseCssText(match[2]);
        selectors.forEach((sel) => map.set(sel, { ...map.get(sel), ...props }));
    }
    return map;
}

function matchCssRules(
    tagName: string,
    className: string,
    id: string,
    rules: Map<string, React.CSSProperties>,
): React.CSSProperties {
    let merged: React.CSSProperties = {};
    const selectors: string[] = [tagName];
    if (className) className.split(/\s+/).forEach((c) => selectors.push(`.${c}`));
    if (id) selectors.push(`#${id}`);
    selectors.forEach((sel) => {
        const found = rules.get(sel);
        if (found) merged = { ...merged, ...found };
    });
    return merged;
}

function nodeToElement(
    node: ChildNode,
    cssRules: Map<string, React.CSSProperties>,
): EditorElement | null {
    if (node.nodeType === 3) {
        const text = node.textContent?.trim();
        if (!text) return null;
        return {
            id: uuidv4(),
            name: "Text",
            type: "text",
            styles: {},
            content: { innerText: text },
        };
    }

    if (node.nodeType !== 1) return null;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === "style" || tag === "script") return null;

    const inlineStyle = parseCssText(el.getAttribute("style") || "");
    const cssMatched = matchCssRules(
        tag,
        el.getAttribute("class") || "",
        el.getAttribute("id") || "",
        cssRules,
    );
    const styles: React.CSSProperties = { ...cssMatched, ...inlineStyle };
    const friendlyName = el.getAttribute("data-name") || tag.charAt(0).toUpperCase() + tag.slice(1);

    if (IMAGE_TAGS.has(tag)) {
        return {
            id: uuidv4(),
            name: friendlyName,
            type: "image",
            styles: { width: "100%", ...styles },
            content: {
                src: el.getAttribute("src") || "",
                alt: el.getAttribute("alt") || "",
            },
        };
    }

    if (VIDEO_TAGS.has(tag)) {
        return {
            id: uuidv4(),
            name: friendlyName,
            type: "video",
            styles,
            content: {
                src: el.getAttribute("src") || el.getAttribute("data-src") || "",
            },
        };
    }

    if (LINK_TAGS.has(tag)) {
        const inner = el.textContent?.trim() || "Link";
        return {
            id: uuidv4(),
            name: friendlyName,
            type: "link",
            styles,
            content: {
                href: el.getAttribute("href") || "#",
                innerText: inner,
            },
        };
    }

    if (HEADING_TAGS.has(tag) && el.children.length === 0) {
        return {
            id: uuidv4(),
            name: friendlyName,
            type: "text",
            styles,
            content: { innerText: el.textContent?.trim() || "" },
        };
    }

    const children: EditorElement[] = [];
    el.childNodes.forEach((child) => {
        const parsed = nodeToElement(child, cssRules);
        if (parsed) children.push(parsed);
    });

    if (children.length === 0 && el.textContent?.trim()) {
        return {
            id: uuidv4(),
            name: friendlyName,
            type: "text",
            styles,
            content: { innerText: el.textContent.trim() },
        };
    }

    const elType: EditorBtns = SECTION_TAGS.has(tag) ? "section" : "container";

    return {
        id: uuidv4(),
        name: friendlyName,
        type: elType,
        styles,
        content: children,
    };
}

/**
 * Converts raw HTML + optional CSS into an array of EditorElement nodes
 * that can be inserted into the canvas and are individually editable.
 */
export function htmlToEditorElements(
    html: string,
    css: string = "",
): EditorElement[] {
    if (typeof window === "undefined") {
        return [{
            id: uuidv4(),
            name: "Custom Code Block",
            type: "customHtml",
            styles: { width: "100%" },
            content: { html, css },
        }];
    }

    const cssRules = parseCssRules(css);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const elements: EditorElement[] = [];

    doc.body.childNodes.forEach((node) => {
        const parsed = nodeToElement(node, cssRules);
        if (parsed) elements.push(parsed);
    });

    if (elements.length === 0) {
        return [{
            id: uuidv4(),
            name: "Custom Code Block",
            type: "customHtml",
            styles: { width: "100%" },
            content: { html, css },
        }];
    }

    return elements;
}
