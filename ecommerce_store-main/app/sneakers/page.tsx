import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { SNEAKER_PRODUCTS } from "@/lib/store/products";

export const metadata = {
  title: "Giày Sneaker — Stusport",
};

export default function SneakersPage() {
  return (
    <StoreShell activeNav="sneakers">
      <FeaturedSection title="GIÀY SNEAKER" products={SNEAKER_PRODUCTS} />
    </StoreShell>
  );
}
