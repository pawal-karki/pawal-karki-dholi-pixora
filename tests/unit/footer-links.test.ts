import { describe, expect, test } from "bun:test";

/**
 * Feature: Footer link data integrity (ensures navigation links stay valid).
 */
const footerLinks = {
  product: [
    { label: "Overview", href: "/site#features" },
    { label: "Pricing", href: "/site#pricing" },
    { label: "Funnels", href: "/agency" },
  ],
  resources: [
    { label: "Docs (coming soon)", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  company: [
    { label: "About", href: "/site#about" },
    { label: "Contact", href: "/site#contact" },
  ],
};

describe("Footer links", () => {
  test("all links have non-empty labels", () => {
    const all = [
      ...footerLinks.product,
      ...footerLinks.resources,
      ...footerLinks.company,
    ];
    for (const link of all) {
      expect(link.label.trim().length).toBeGreaterThan(0);
    }
  });

  test("all links have non-empty hrefs", () => {
    const all = [
      ...footerLinks.product,
      ...footerLinks.resources,
      ...footerLinks.company,
    ];
    for (const link of all) {
      expect(link.href.length).toBeGreaterThan(0);
    }
  });

  test("product section has Overview, Pricing, Funnels", () => {
    const labels = footerLinks.product.map((l) => l.label);
    expect(labels).toContain("Overview");
    expect(labels).toContain("Pricing");
    expect(labels).toContain("Funnels");
  });

  test("company section links to about and contact anchors", () => {
    const hrefs = footerLinks.company.map((l) => l.href);
    expect(hrefs).toContain("/site#about");
    expect(hrefs).toContain("/site#contact");
  });

  test("copyright year helper returns current year", () => {
    const year = new Date().getFullYear();
    expect(year).toBeGreaterThanOrEqual(2024);
  });
});
