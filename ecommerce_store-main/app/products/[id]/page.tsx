import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/store/ProductDetail";
import { StoreShell } from "@/components/store/StoreShell";
import { getAllProductIds, getProductById } from "@/lib/store/catalog";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams(): { id: string }[] {
  return getAllProductIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return { title: "Không tìm thấy — Stusport" };
  }

  return { title: `${product.name} — Stusport` };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <StoreShell activeNav={product.category}>
      <ProductDetail product={product} />
    </StoreShell>
  );
}
