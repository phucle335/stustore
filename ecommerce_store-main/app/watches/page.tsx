import { FeaturedSection } from "@/components/store/FeaturedSection";
import { StoreShell } from "@/components/store/StoreShell";
import { getProductsByCategory } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Đồng Hồ — Stusport",
};

type WatchesPageProps = {
  searchParams: Promise<{ sort?: string }>;
};

export default async function WatchesPage({ searchParams }: WatchesPageProps) {
  const products = await getProductsByCategory("watches");
  const { sort } = await searchParams;

  return (
    <StoreShell activeNav="watches">
      <FeaturedSection
        title="ĐỒNG HỒ"
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
