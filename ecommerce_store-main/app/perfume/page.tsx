import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { PERFUME_PRODUCTS } from "@/lib/store/products";

export const metadata = {
  title: "Nước Hoa — Stusport",
};

export default function PerfumePage() {
  return (
    <StoreShell activeNav="perfume">
      <FeaturedSection title="NƯỚC HOA" products={PERFUME_PRODUCTS} />
    </StoreShell>
  );
}
