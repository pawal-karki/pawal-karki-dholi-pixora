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
