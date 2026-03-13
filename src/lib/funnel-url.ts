/** Normalise scheme env (may be "https:" or "https"). */
export function normalizeScheme(schemeEnv: string | undefined): string {
  const raw = schemeEnv?.trim() || "http";
  return raw.includes(":") ? raw.split(":")[0]! : raw;
}

/** Public URL for a live funnel page (matches funnel-steps / EditorContact patterns). */
export function buildPublishedFunnelPageUrl(params: {
  subDomainName: string;
  pathName: string;
  scheme?: string;
  domain?: string;
}): string {
  const protocol = normalizeScheme(params.scheme);
  const domain = params.domain?.trim() || "localhost:3000";
  const sub = params.subDomainName.trim();
  const path = params.pathName.replace(/^\//, "");
  return `${protocol}://${sub}.${domain}/${path}`;
}
