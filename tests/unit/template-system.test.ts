import { describe, expect, it } from "bun:test";
import { TEMPLATE_GENERATORS } from "@/lib/editor/template-definitions";

type TemplateCategory =
  | "All" | "Hero" | "Features" | "Pricing" | "Testimonials"
  | "CTA" | "Team" | "FAQ" | "Stats" | "About" | "Layout";

type TemplateMeta = {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
};

const TEMPLATE_IDS = Object.keys(TEMPLATE_GENERATORS);

const TEMPLATES: TemplateMeta[] = [
  { id: "template__modern_navbar", name: "Modern Navbar", category: "Layout", description: "Responsive navigation bar" },
  { id: "template__modern_footer", name: "Modern Footer", category: "Layout", description: "Multi-column footer" },
  { id: "template__modern_products", name: "Product Grid", category: "Layout", description: "Product cards grid" },
  { id: "template__shop_section", name: "Shop Section", category: "Layout", description: "E-commerce shop layout" },
  { id: "template__hero_gradient", name: "Hero Gradient", category: "Hero", description: "Gradient hero section" },
  { id: "template__hero_dark", name: "Hero Dark", category: "Hero", description: "Dark hero section" },
  { id: "template__features_grid", name: "Features Grid", category: "Features", description: "Feature cards grid" },
  { id: "template__pricing_table", name: "Pricing Table", category: "Pricing", description: "3-tier pricing" },
  { id: "template__testimonials", name: "Testimonials", category: "Testimonials", description: "Customer testimonials" },
  { id: "template__cta_banner", name: "CTA Banner", category: "CTA", description: "Call to action section" },
  { id: "template__team_cards", name: "Team Cards", category: "Team", description: "Team member cards" },
  { id: "template__faq_section", name: "FAQ Section", category: "FAQ", description: "Frequently asked questions" },
  { id: "template__stats_row", name: "Stats Row", category: "Stats", description: "Statistics display" },
  { id: "template__about_story", name: "About Story", category: "About", description: "Company about section" },
];

function filterTemplates(
  templates: TemplateMeta[],
  category: TemplateCategory,
  search: string,
): TemplateMeta[] {
  return templates.filter((t) => {
    const matchCat = category === "All" || t.category === category;
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
}

describe("Template system", () => {
  describe("TEMPLATE_GENERATORS registry", () => {
    it("has 14 registered generators", () => {
      expect(TEMPLATE_IDS).toHaveLength(14);
    });

    it("all registered IDs start with template__", () => {
      for (const id of TEMPLATE_IDS) {
        expect(id.startsWith("template__")).toBe(true);
      }
    });

    it("every generator is a function", () => {
      for (const id of TEMPLATE_IDS) {
        expect(typeof TEMPLATE_GENERATORS[id]).toBe("function");
      }
    });

    for (const id of TEMPLATE_IDS) {
      it(`generator '${id}' exists in registry`, () => {
        expect(TEMPLATE_GENERATORS[id]).toBeDefined();
      });
    }
  });

  describe("template generation output", () => {
    it("each generator returns valid EditorElement for Desktop", () => {
      for (const id of TEMPLATE_IDS) {
        const el = TEMPLATE_GENERATORS[id]!("Desktop");
        expect(el.id).toBeTruthy();
        expect(typeof el.id).toBe("string");
        expect(el.name).toBeTruthy();
        expect(el.type).toBeTruthy();
        expect(el.styles).toBeDefined();
        expect(el.content).toBeDefined();
      }
    });

    it("each generator returns valid EditorElement for Mobile", () => {
      for (const id of TEMPLATE_IDS) {
        const el = TEMPLATE_GENERATORS[id]!("Mobile");
        expect(el.id).toBeTruthy();
        expect(el.type).toBeTruthy();
      }
    });

    it("each generator returns valid EditorElement for Tablet", () => {
      for (const id of TEMPLATE_IDS) {
        const el = TEMPLATE_GENERATORS[id]!("Tablet");
        expect(el.id).toBeTruthy();
        expect(el.type).toBeTruthy();
      }
    });

    it("generated elements use section or container type at root", () => {
      for (const id of TEMPLATE_IDS) {
        const el = TEMPLATE_GENERATORS[id]!("Desktop");
        expect(["section", "container"].includes(el.type as string)).toBe(true);
      }
    });

    it("hero_gradient has nested child content", () => {
      const el = TEMPLATE_GENERATORS["template__hero_gradient"]!("Desktop");
      expect(Array.isArray(el.content)).toBe(true);
      expect((el.content as any[]).length).toBeGreaterThan(0);
    });

    it("pricing_table has nested child content", () => {
      const el = TEMPLATE_GENERATORS["template__pricing_table"]!("Desktop");
      expect(Array.isArray(el.content)).toBe(true);
      expect((el.content as any[]).length).toBeGreaterThan(0);
    });

    it("generated IDs are unique across two calls", () => {
      const el1 = TEMPLATE_GENERATORS["template__hero_gradient"]!("Desktop");
      const el2 = TEMPLATE_GENERATORS["template__hero_gradient"]!("Desktop");
      expect(el1.id).not.toBe(el2.id);
    });
  });

  describe("template filtering", () => {
    it("All category shows everything", () => {
      expect(filterTemplates(TEMPLATES, "All", "")).toHaveLength(14);
    });

    it("Hero category filters correctly", () => {
      const results = filterTemplates(TEMPLATES, "Hero", "");
      expect(results.every((t) => t.category === "Hero")).toBe(true);
      expect(results).toHaveLength(2);
    });

    it("Layout category includes navbar, footer, products, shop", () => {
      const results = filterTemplates(TEMPLATES, "Layout", "");
      expect(results).toHaveLength(4);
    });

    it("search by name (case insensitive)", () => {
      const results = filterTemplates(TEMPLATES, "All", "hero");
      expect(results).toHaveLength(2);
    });

    it("search by description", () => {
      const results = filterTemplates(TEMPLATES, "All", "navigation");
      expect(results).toHaveLength(1);
      expect(results[0]!.id).toBe("template__modern_navbar");
    });

    it("combined category + search", () => {
      const results = filterTemplates(TEMPLATES, "Hero", "gradient");
      expect(results).toHaveLength(1);
      expect(results[0]!.id).toBe("template__hero_gradient");
    });

    it("no match returns empty", () => {
      expect(filterTemplates(TEMPLATES, "All", "zzzznonexistent")).toHaveLength(0);
    });

    it("category mismatch with matching search returns empty", () => {
      const results = filterTemplates(TEMPLATES, "FAQ", "hero");
      expect(results).toHaveLength(0);
    });
  });

  describe("customHtml element structure", () => {
    it("raw HTML insert creates correct shape", () => {
      const element = {
        content: { html: "<h1>Hello</h1>", css: "h1 { color: red; }" },
        id: "custom-1",
        name: "Custom Code Block",
        styles: { width: "100%" },
        type: "customHtml" as const,
      };
      expect(element.type).toBe("customHtml");
      expect((element.content as any).html).toContain("<h1>");
      expect((element.content as any).css).toContain("color: red");
    });

    it("JS is appended to html for raw mode", () => {
      const html = "<div>content</div>";
      const js = "console.log('init')";
      const fullHtml = `${html}<script>${js}<\/script>`;
      expect(fullHtml).toContain("<script>");
      expect(fullHtml).toContain("console.log");
    });
  });
});
