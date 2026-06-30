import { FeaturedSection } from "@/components/store/FeaturedSection";
import "@/styles/pages/search.css";
import { StoreShell } from "@/components/store/StoreShell";
import { getAllProducts } from "@/lib/store/catalog";
import { searchProducts } from "@/lib/store/search";
import { STORE_NAME } from "@/lib/store/site";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{ q?: string; sort?: string }>;
};

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  return {
    title: query
      ? `Search: ${query} — ${STORE_NAME}`
      : `Search — ${STORE_NAME}`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, sort } = await searchParams;
  const query = q?.trim() ?? "";
  const allProducts = await getAllProducts();
  const results = searchProducts(allProducts, query);

  return (
    <StoreShell activeNav="home">
      <FeaturedSection
        title={
          query
            ? `SEARCH RESULTS: "${query.toUpperCase()}" (${results.length})`
            : "SEARCH PRODUCTS"
        }
        products={results}
        initialSort={
          sort === "price_asc" || sort === "price_desc" || sort === "name_asc" || sort === "name_desc"
            ? (sort as any)
            : undefined
        }
      />
      {query && results.length === 0 ? (
        <p className="search-empty">
          No matching products found. Try different keywords or browse categories
          from the menu.
        </p>
      ) : null}
    </StoreShell>
  );
}
