import "@/styles/pages/bags.css";
import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { getProductsByCategory } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Túi Xách — Stusport",
};

type BagsPageProps = {
  searchParams: Promise<{ sort?: string }>;
};

export default async function BagsPage({ searchParams }: BagsPageProps) {
  const products = await getProductsByCategory("bags");
  const { sort } = await searchParams;

  return (
    <StoreShell activeNav="bags">
      <FeaturedSection
        title="TÚI XÁCH"
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
