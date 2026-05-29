export type DeviceType = "mobile" | "desktop" | "tablet";

const PRODUCT_PATH_RE = /^\/products\/([^/?#]+)/;

export function parseProductIdFromPath(path: string | null | undefined): string | null {
  if (!path) return null;
  const match = path.match(PRODUCT_PATH_RE);
  return match?.[1]?.trim() || null;
}

export function parseDeviceType(
  userAgent: string | null | undefined,
  clientHint?: string | null,
): DeviceType {
  const hint = clientHint?.toLowerCase().trim();
  if (hint === "mobile") return "mobile";
  if (hint === "tablet") return "tablet";
  if (hint === "desktop") return "desktop";

  const ua = (userAgent ?? "").toLowerCase();
  if (!ua) return "desktop";

  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

export function getCountryCodeFromRequest(request: Request): string | null {
  const raw =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    "";
  const code = raw.trim().toUpperCase();
  if (!code || code === "XX" || code === "T1") return null;
  return code.slice(0, 2);
}

export function shortSessionId(sessionId: string): string {
  const s = sessionId.trim();
  if (s.length <= 8) return s;
  return s.slice(-6);
}

export function deviceLabel(device: string | null | undefined): string {
  switch (device) {
    case "mobile":
      return "Mobile";
    case "tablet":
      return "Tablet";
    case "desktop":
      return "Desktop";
    default:
      return "Không rõ";
  }
}
