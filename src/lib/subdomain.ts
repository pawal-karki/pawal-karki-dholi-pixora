import { buildPublishedFunnelPageUrl } from "@/lib/funnel-url";

/** Default public hostname for published funnels (`{slug}.pawal.dev`). Override with `NEXT_PUBLIC_DOMAIN`. */
export const DEFAULT_FUNNEL_PUBLIC_DOMAIN = "pawal.dev";

/**
 * Apex domain used when building `*.pawal.dev` (or custom) URLs for published funnels.
 */
export function getFunnelBaseDomain(): string {
  const fromEnv = process.env.NEXT_PUBLIC_DOMAIN?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_FUNNEL_PUBLIC_DOMAIN;
}

/**
 * Full host for a funnel slug, e.g. `offer` → `offer.pawal.dev`.
 */
export function getFunnelSubdomainHost(slug: string): string {
  const s = slug.trim().toLowerCase();
  return `${s}.${getFunnelBaseDomain()}`;
}

/**
 * Canonical browser URL for the funnel root (trailing slash stripped).
 */
export function getFunnelLiveSiteUrl(slug: string): string {
  return buildPublishedFunnelPageUrl({
    subDomainName: slug,
    pathName: "",
    scheme: process.env.NEXT_PUBLIC_SCHEME,
    domain: getFunnelBaseDomain(),
  }).replace(/\/$/, "");
}

/**
 * Resolves the funnel / tenant subdomain segment from the HTTP Host header.
 * Mirrors middleware behaviour so it can be unit-tested without NextRequest.
 */
export function resolveCustomSubdomain(
  hostHeader: string,
  nextPublicDomain: string | undefined,
): string | null {
  let customSubDomain: string | null = null;

  if (nextPublicDomain) {
    const baseDomain = nextPublicDomain;
    if (hostHeader.includes(baseDomain) && hostHeader !== baseDomain) {
      const hostWithoutPort = hostHeader.split(":")[0];
      const baseDomainWithoutPort = baseDomain.split(":")[0];
      customSubDomain = hostWithoutPort
        .replace(baseDomainWithoutPort, "")
        .replace(/\.$/, "")
        .replace(/^\./, "")
        .trim();
    }
  } else {
    const hostWithoutPort = hostHeader.split(":")[0];
    const hostParts = hostWithoutPort.split(".");

    if (hostWithoutPort.includes("localhost") && hostParts.length >= 2) {
      customSubDomain = hostParts[0];
    } else if (
      !hostWithoutPort.includes("localhost") &&
      hostParts.length >= 3
    ) {
      const firstPart = hostParts[0];
      const knownPrefixes = ["www", "api", "app", "admin"];
      if (!knownPrefixes.includes(firstPart.toLowerCase())) {
        customSubDomain = firstPart;
      }
    }
  }

  if (!customSubDomain || customSubDomain.trim() === "") return null;
  return customSubDomain.trim().toLowerCase();
}
