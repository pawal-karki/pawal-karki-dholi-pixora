import { describe, expect, test } from "bun:test";
import { buildPublishedFunnelPageUrl, normalizeScheme } from "@/lib/funnel-url";
import { assignSequentialOrder } from "@/lib/dnd-reorder";

type FunnelPage = {
  id: string;
  name: string;
  pathName: string;
  order: number;
  visits: number;
  content: string | null;
};

const DEFAULT_BODY_JSON = JSON.stringify([{
  content: [],
  id: "__body",
  name: "Body",
  styles: { backgroundColor: "white" },
  type: "__body",
}]);

function resolveContent(input: string | null | undefined): string {
  return input || DEFAULT_BODY_JSON;
}

function generateCheckoutPage(productName: string, content: string, uuid: string): FunnelPage {
  const slug = `checkout-${productName.toLowerCase().replace(/\s+/g, "-")}-${uuid.slice(0, 4)}`;
  return {
    id: uuid,
    name: `Checkout - ${productName}`,
    pathName: slug,
    order: 99,
    visits: 0,
    content,
  };
}

function incrementVisits(page: FunnelPage): FunnelPage {
  return { ...page, visits: page.visits + 1 };
}

function sortPagesByOrder(pages: FunnelPage[]): FunnelPage[] {
  return [...pages].sort((a, b) => a.order - b.order);
}

function getPublicUrl(subdomain: string, pathName: string): string {
  return buildPublishedFunnelPageUrl({
    subDomainName: subdomain,
    pathName,
    scheme: process.env.NEXT_PUBLIC_SCHEME,
    domain: process.env.NEXT_PUBLIC_DOMAIN,
  });
}

function validateFunnelPageName(name: string): { ok: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Page name cannot be empty" };
  if (trimmed.length > 100) return { ok: false, error: "Page name too long" };
  return { ok: true };
}

function validatePathName(path: string): { ok: boolean; error?: string } {
  const trimmed = path.trim();
  if (!trimmed) return { ok: true };
  if (/[^a-z0-9\-_]/.test(trimmed)) return { ok: false, error: "Path must be lowercase alphanumeric, hyphens, or underscores" };
  return { ok: true };
}

describe("Funnel pages CRUD helpers", () => {
  describe("content resolution", () => {
    test("null content gets default body", () => {
      const content = resolveContent(null);
      const parsed = JSON.parse(content);
      expect(parsed[0].type).toBe("__body");
      expect(parsed[0].id).toBe("__body");
    });

    test("undefined content gets default body", () => {
      const content = resolveContent(undefined);
      expect(JSON.parse(content)[0].type).toBe("__body");
    });

    test("existing content preserved", () => {
      const custom = JSON.stringify([{ id: "custom-body", type: "__body", content: [{ id: "t1" }] }]);
      expect(resolveContent(custom)).toBe(custom);
    });

    test("empty string gets default body", () => {
      const content = resolveContent("");
      expect(JSON.parse(content)[0].id).toBe("__body");
    });
  });

  describe("checkout page generation", () => {
    test("generates correct name", () => {
      const page = generateCheckoutPage("Pro Plan", "{}", "abcdef12-3456-7890");
      expect(page.name).toBe("Checkout - Pro Plan");
    });

    test("generates lowercase slug with uuid slice", () => {
      const page = generateCheckoutPage("My Product", "{}", "abcdef12-3456-7890");
      expect(page.pathName).toBe("checkout-my-product-abcd");
    });

    test("collapses multiple spaces in product name", () => {
      const page = generateCheckoutPage("Super  Mega  Plan", "{}", "xyz12345");
      expect(page.pathName).toBe("checkout-super-mega-plan-xyz1");
    });

    test("order is always 99", () => {
      const page = generateCheckoutPage("Test", "{}", "1234");
      expect(page.order).toBe(99);
    });

    test("visits start at 0", () => {
      const page = generateCheckoutPage("Test", "{}", "1234");
      expect(page.visits).toBe(0);
    });

    test("preserves provided content", () => {
      const content = JSON.stringify([{ id: "__body", type: "__body" }]);
      const page = generateCheckoutPage("X", content, "aaaa");
      expect(page.content).toBe(content);
    });
  });

  describe("visit tracking", () => {
    const page: FunnelPage = {
      id: "p1", name: "Landing", pathName: "landing", order: 0, visits: 5, content: null,
    };

    test("increments by 1", () => {
      expect(incrementVisits(page).visits).toBe(6);
    });

    test("does not mutate original", () => {
      incrementVisits(page);
      expect(page.visits).toBe(5);
    });

    test("works from 0", () => {
      expect(incrementVisits({ ...page, visits: 0 }).visits).toBe(1);
    });
  });

  describe("page sorting by order", () => {
    test("sorts ascending", () => {
      const pages: FunnelPage[] = [
        { id: "p3", name: "C", pathName: "c", order: 2, visits: 0, content: null },
        { id: "p1", name: "A", pathName: "a", order: 0, visits: 0, content: null },
        { id: "p2", name: "B", pathName: "b", order: 1, visits: 0, content: null },
      ];
      const sorted = sortPagesByOrder(pages);
      expect(sorted.map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
    });

    test("checkout page (order 99) comes last", () => {
      const pages: FunnelPage[] = [
        { id: "checkout", name: "Checkout", pathName: "checkout", order: 99, visits: 0, content: null },
        { id: "landing", name: "Landing", pathName: "landing", order: 0, visits: 0, content: null },
        { id: "pricing", name: "Pricing", pathName: "pricing", order: 1, visits: 0, content: null },
      ];
      const sorted = sortPagesByOrder(pages);
      expect(sorted[sorted.length - 1]!.id).toBe("checkout");
    });
  });

  describe("page reorder with sequential order assignment", () => {
    test("after drag-drop assigns 0-based sequential order", () => {
      const pages = [
        { id: "p1", name: "A", order: 0 },
        { id: "p2", name: "B", order: 1 },
        { id: "p3", name: "C", order: 2 },
      ];
      const reordered = assignSequentialOrder([pages[2]!, pages[0]!, pages[1]!]);
      expect(reordered.map((p) => p.order)).toEqual([0, 1, 2]);
      expect(reordered.map((p) => p.id)).toEqual(["p3", "p1", "p2"]);
    });
  });

  describe("published URL construction", () => {
    test("builds full public URL", () => {
      process.env.NEXT_PUBLIC_SCHEME = "https";
      process.env.NEXT_PUBLIC_DOMAIN = "pixora.app";
      const url = getPublicUrl("my-funnel", "landing");
      expect(url).toBe("https://my-funnel.pixora.app/landing");
    });

    test("strips leading slash from path", () => {
      process.env.NEXT_PUBLIC_SCHEME = "https";
      process.env.NEXT_PUBLIC_DOMAIN = "pixora.app";
      const url = getPublicUrl("sale", "/checkout");
      expect(url).toBe("https://sale.pixora.app/checkout");
    });

    test("falls back to http + localhost when env not set", () => {
      delete process.env.NEXT_PUBLIC_SCHEME;
      delete process.env.NEXT_PUBLIC_DOMAIN;
      const url = getPublicUrl("test", "page1");
      expect(url).toBe("http://test.localhost:3000/page1");
    });
  });

  describe("page name validation", () => {
    test("valid name passes", () => {
      expect(validateFunnelPageName("Landing Page").ok).toBe(true);
    });
    test("empty name fails", () => {
      expect(validateFunnelPageName("").ok).toBe(false);
    });
    test("whitespace-only name fails", () => {
      expect(validateFunnelPageName("   ").ok).toBe(false);
    });
    test("100+ char name fails", () => {
      expect(validateFunnelPageName("x".repeat(101)).ok).toBe(false);
    });
    test("exactly 100 chars passes", () => {
      expect(validateFunnelPageName("x".repeat(100)).ok).toBe(true);
    });
  });

  describe("pathName validation", () => {
    test("empty path is allowed (optional)", () => {
      expect(validatePathName("").ok).toBe(true);
    });
    test("lowercase slug passes", () => {
      expect(validatePathName("my-page").ok).toBe(true);
    });
    test("underscore slug passes", () => {
      expect(validatePathName("my_page").ok).toBe(true);
    });
    test("uppercase fails", () => {
      expect(validatePathName("My-Page").ok).toBe(false);
    });
    test("spaces fail", () => {
      expect(validatePathName("my page").ok).toBe(false);
    });
    test("special chars fail", () => {
      expect(validatePathName("page!@#").ok).toBe(false);
    });
  });
});
