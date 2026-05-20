import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { WATCHES_PRODUCTS } from "@/lib/store/products";

export const metadata = {
  title: "Đồng Hồ — Stusport",
};

export default function WatchesPage() {
  return (
    <StoreShell activeNav="watches">
      <FeaturedSection title="ĐỒNG HỒ" products={WATCHES_PRODUCTS} />
    </StoreShell>
  );
}
