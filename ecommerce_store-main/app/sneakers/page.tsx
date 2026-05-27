import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { getProductsByCategory } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Giày Sneaker — Stusport",
};

export default async function SneakersPage() {
  const products = await getProductsByCategory("sneakers");

  return (
    <StoreShell activeNav="sneakers">
      <FeaturedSection title="GIÀY SNEAKER" products={products} />
    </StoreShell>
  );
}
