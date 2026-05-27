import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { getProductsByCategory } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Túi Xách — Stusport",
};

export default async function BagsPage() {
  const products = await getProductsByCategory("bags");

  return (
    <StoreShell activeNav="bags">
      <FeaturedSection title="TÚI XÁCH" products={products} />
    </StoreShell>
  );
}
