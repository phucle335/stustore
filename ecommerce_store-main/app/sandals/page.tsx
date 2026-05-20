import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { SANDALS_PRODUCTS } from "@/lib/store/products";

export const metadata = {
  title: "Dép — Stusport",
};

export default function SandalsPage() {
  return (
    <StoreShell activeNav="sandals">
      <FeaturedSection title="DÉP" products={SANDALS_PRODUCTS} />
    </StoreShell>
  );
}
