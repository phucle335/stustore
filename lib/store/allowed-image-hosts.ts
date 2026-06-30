/** Allowed hostnames for next/image optimization — synced with next.config.ts */
export const STATIC_IMAGE_HOSTS = [
  "images.unsplash.com",
  "cdn.coverr.co",
  "cdn.phototourl.com",
  "minhshop.vn",
  "assets.storims.com",
  "cdn.storims.com",
  "storage.googleapis.com",
  "static.nike.com",
  "images.nike.com",
] as const;

export function supabaseStorageHost(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

export function buildImageRemotePatterns(): {
  protocol: "https";
  hostname: string;
}[] {
  const supabaseHost = supabaseStorageHost();
  return [
    ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost }] : []),
    ...STATIC_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  ];
}

/** URL allowed with next/image (declared hostname) */
export function isNextImageAllowedUrl(src: string): boolean {
  try {
    const { hostname, protocol } = new URL(src);
    if (protocol !== "https:" && protocol !== "http:") {
      return false;
    }
    if ((STATIC_IMAGE_HOSTS as readonly string[]).includes(hostname)) {
      return true;
    }
    const supabaseHost = supabaseStorageHost();
    if (supabaseHost && hostname === supabaseHost) {
      return true;
    }
    return hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}
