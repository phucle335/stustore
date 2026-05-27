import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { getProductsByCategory } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sunglasses — Stusport",
};

export default async function SunglassesPage() {
  const products = await getProductsByCategory("sunglasses");

  return (
    <StoreShell activeNav="sunglasses">
      <FeaturedSection title="SUNGLASSES" products={products} />
    </StoreShell>
  );
}
