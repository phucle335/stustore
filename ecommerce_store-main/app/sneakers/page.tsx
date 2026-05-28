import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { getProductsByCategory } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Giày Sneaker — Stusport",
};

type SneakersPageProps = {
  searchParams: Promise<{ sort?: string }>;
};

export default async function SneakersPage({ searchParams }: SneakersPageProps) {
  const products = await getProductsByCategory("sneakers");
  const { sort } = await searchParams;

  return (
    <StoreShell activeNav="sneakers">
      <FeaturedSection
        title="GIÀY SNEAKER"
        products={products}
        initialSort={
          sort === "price_asc" || sort === "price_desc" || sort === "name_asc" || sort === "name_desc"
            ? (sort as any)
            : undefined
        }
      />
    </StoreShell>
  );
}
