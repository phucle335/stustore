import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { CLOTHING_PRODUCTS } from "@/lib/store/products";

export const metadata = {
  title: "Quần Áo — Stusport",
};

export default function ClothingPage() {
  return (
    <StoreShell activeNav="clothing">
      <FeaturedSection title="QUẦN ÁO" products={CLOTHING_PRODUCTS} />
    </StoreShell>
  );
}
