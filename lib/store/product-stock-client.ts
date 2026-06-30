import type { ProductStockSnapshot } from "@/lib/store/products-data";

let cache: Record<string, ProductStockSnapshot> | null = null;
let inflight: Promise<Record<string, ProductStockSnapshot>> | null = null;

export async function fetchProductStockMap(): Promise<
  Record<string, ProductStockSnapshot>
> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = fetch("/api/store/product-stock", { cache: "no-store" })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error("Could not load product stock");
      }
      return res.json() as Promise<Record<string, ProductStockSnapshot>>;
    })
    .then((data) => {
      cache = data;
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function getStockFromMap(
  stockMap: Record<string, ProductStockSnapshot>,
  productId: string,
  size?: string,
): number {
  const entry = stockMap[productId];
  if (!entry) return 0;
  if (size !== undefined && entry.sizeStock) {
    return entry.sizeStock[size] ?? 0;
  }
  return entry.stock;
}

export function invalidateProductStockCache() {
  cache = null;
}
