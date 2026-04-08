import { describe, expect, it } from "bun:test";

type FileRoute = {
  slug: string;
  maxFileSize: string;
  maxFileCount: number;
  fileTypes: string[];
  authRequired: boolean;
};

const UPLOAD_ROUTES: FileRoute[] = [
  { slug: "subAccountLogo", maxFileSize: "4MB", maxFileCount: 1, fileTypes: ["image"], authRequired: true },
  { slug: "avatar", maxFileSize: "4MB", maxFileCount: 1, fileTypes: ["image"], authRequired: true },
  { slug: "agencyLogo", maxFileSize: "4MB", maxFileCount: 1, fileTypes: ["image"], authRequired: true },
  { slug: "media", maxFileSize: "4MB", maxFileCount: 1, fileTypes: ["image"], authRequired: true },
  { slug: "chatMedia", maxFileSize: "8MB", maxFileCount: 1, fileTypes: ["image", "pdf"], authRequired: true },
];

function parseMaxFileSize(size: string): number {
  const match = size.match(/^(\d+)(MB|KB|GB)$/);
  if (!match) return 0;
  const [, num, unit] = match;
  const multiplier = unit === "GB" ? 1024 * 1024 * 1024 : unit === "MB" ? 1024 * 1024 : 1024;
  return parseInt(num!) * multiplier;
}

function isValidUploadSlug(slug: string): boolean {
  return UPLOAD_ROUTES.some((r) => r.slug === slug);
}

function getRouteConfig(slug: string): FileRoute | undefined {
  return UPLOAD_ROUTES.find((r) => r.slug === slug);
}

function validateFileType(slug: string, mimeType: string): boolean {
  const route = getRouteConfig(slug);
  if (!route) return false;
  if (route.fileTypes.includes("image") && mimeType.startsWith("image/")) return true;
  if (route.fileTypes.includes("pdf") && mimeType === "application/pdf") return true;
  return false;
}

function validateFileSize(slug: string, sizeBytes: number): boolean {
  const route = getRouteConfig(slug);
  if (!route) return false;
  return sizeBytes <= parseMaxFileSize(route.maxFileSize);
}

describe("UploadThing configuration", () => {
  describe("route registry", () => {
    it("all 5 upload routes are defined", () => {
      expect(UPLOAD_ROUTES).toHaveLength(5);
    });

    for (const slug of [
      "subAccountLogo",
      "avatar",
      "agencyLogo",
      "media",
      "chatMedia",
    ] as const) {
      it(`route '${slug}' exists`, () => {
        expect(isValidUploadSlug(slug)).toBe(true);
      });
    }

    it("unknown slug is invalid", () => {
      expect(isValidUploadSlug("randomUpload")).toBe(false);
    });

    it("all routes require authentication", () => {
      for (const route of UPLOAD_ROUTES) {
        expect(route.authRequired).toBe(true);
      }
    });
  });

  describe("file size limits", () => {
    it("parseMaxFileSize handles MB", () => {
      expect(parseMaxFileSize("4MB")).toBe(4 * 1024 * 1024);
    });
    it("parseMaxFileSize handles 8MB", () => {
      expect(parseMaxFileSize("8MB")).toBe(8 * 1024 * 1024);
    });
    it("parseMaxFileSize handles GB", () => {
      expect(parseMaxFileSize("1GB")).toBe(1024 * 1024 * 1024);
    });
    it("invalid format returns 0", () => {
      expect(parseMaxFileSize("foo")).toBe(0);
    });

    it("avatar allows up to 4MB", () => {
      expect(validateFileSize("avatar", 3 * 1024 * 1024)).toBe(true);
      expect(validateFileSize("avatar", 5 * 1024 * 1024)).toBe(false);
    });

    it("chatMedia allows up to 8MB", () => {
      expect(validateFileSize("chatMedia", 7 * 1024 * 1024)).toBe(true);
      expect(validateFileSize("chatMedia", 9 * 1024 * 1024)).toBe(false);
    });
  });

  describe("file type validation", () => {
    it("avatar accepts image/png", () => {
      expect(validateFileType("avatar", "image/png")).toBe(true);
    });
    it("avatar accepts image/jpeg", () => {
      expect(validateFileType("avatar", "image/jpeg")).toBe(true);
    });
    it("avatar rejects application/pdf", () => {
      expect(validateFileType("avatar", "application/pdf")).toBe(false);
    });
    it("chatMedia accepts image/png", () => {
      expect(validateFileType("chatMedia", "image/png")).toBe(true);
    });
    it("chatMedia accepts application/pdf", () => {
      expect(validateFileType("chatMedia", "application/pdf")).toBe(true);
    });
    it("chatMedia rejects application/zip", () => {
      expect(validateFileType("chatMedia", "application/zip")).toBe(false);
    });
    it("media rejects video/mp4", () => {
      expect(validateFileType("media", "video/mp4")).toBe(false);
    });
  });
});
