import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { getProductsByCategory } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Đồng Hồ — Stusport",
};

export default async function WatchesPage() {
  const products = await getProductsByCategory("watches");

  return (
    <StoreShell activeNav="watches">
      <FeaturedSection title="ĐỒNG HỒ" products={products} />
    </StoreShell>
  );
}
