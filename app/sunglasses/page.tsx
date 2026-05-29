import "@/styles/pages/sunglasses.css";
import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { getProductsByCategory } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sunglasses — Stusport",
};

type SunglassesPageProps = {
  searchParams: Promise<{ sort?: string }>;
};

export default async function SunglassesPage({ searchParams }: SunglassesPageProps) {
  const products = await getProductsByCategory("sunglasses");
  const { sort } = await searchParams;

  return (
    <StoreShell activeNav="sunglasses">
      <FeaturedSection
        title="SUNGLASSES"
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
