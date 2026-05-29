import { PAGE_ROUTES } from "@/lib/store/site";

type SearchRouter = {
  push: (href: string) => void;
};

export function buildSearchUrl(query: string): string | null {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return `${PAGE_ROUTES.search}?q=${encodeURIComponent(trimmed)}`;
}

export function submitStoreSearch(router: SearchRouter, query: string): boolean {
  const url = buildSearchUrl(query);
  if (!url) {
    return false;
  }
  router.push(url);
  return true;
}
