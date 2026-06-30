import "@/styles/pages/clothing.css";
import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { getProductsByCategory } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clothing — Stusport",
};

type ClothingPageProps = {
  searchParams: Promise<{ sort?: string }>;
};

export default async function ClothingPage({ searchParams }: ClothingPageProps) {
  const products = await getProductsByCategory("clothing");
  const { sort } = await searchParams;

  return (
    <StoreShell activeNav="clothing">
      <FeaturedSection
        title="CLOTHING"
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
