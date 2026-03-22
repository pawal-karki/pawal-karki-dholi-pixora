import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { createElement } from "react";

import Pipelines from "@/components/icons/pipelines";

/**
 * Feature: Pipeline SVG icon renders correctly for sidebar / UI.
 */
describe("Pipelines icon component", () => {
  test("renders an SVG element", () => {
    const html = renderToString(createElement(Pipelines));
    expect(html).toContain("<svg");
    expect(html).toContain("</svg>");
  });

  test("has 24x24 viewBox", () => {
    const html = renderToString(createElement(Pipelines));
    expect(html).toContain('viewBox="0 0 24 24"');
  });

  test("uses currentColor stroke for theme support", () => {
    const html = renderToString(createElement(Pipelines));
    expect(html).toContain('stroke="currentColor"');
  });

  test("contains funnel path data", () => {
    const html = renderToString(createElement(Pipelines));
    expect(html).toContain("<path");
  });

  test("has lucide className for styling", () => {
    const html = renderToString(createElement(Pipelines));
    expect(html).toContain("lucide");
  });
});
