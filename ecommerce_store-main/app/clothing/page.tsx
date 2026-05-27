import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { getProductsByCategory } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quần Áo — Stusport",
};

export default async function ClothingPage() {
  const products = await getProductsByCategory("clothing");

  return (
    <StoreShell activeNav="clothing">
      <FeaturedSection title="QUẦN ÁO" products={products} />
    </StoreShell>
  );
}
