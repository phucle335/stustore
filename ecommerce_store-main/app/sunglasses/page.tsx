import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { SUNGLASSES_PRODUCTS } from "@/lib/store/products";

export const metadata = {
  title: "Sunglasses — Stusport",
};

export default function SunglassesPage() {
  return (
    <StoreShell activeNav="sunglasses">
      <FeaturedSection title="SUNGLASSES" products={SUNGLASSES_PRODUCTS} />
    </StoreShell>
  );
}
