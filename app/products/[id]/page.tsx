import "@/styles/pages/product-detail.css";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetail } from "@/components/store/ProductDetail";
import { StoreShell } from "@/components/store/StoreShell";
import { ProductOrderNotice } from "@/components/store/ProductOrderNotice";
import { getProductById, getRelatedProductsByBrand } from "@/lib/store/catalog";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: "Not Found — Stusport" };
  }

  return { title: `${product.name} — Stusport` };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProductsByBrand(
    product.id,
    product.brand,
    8,
  );

  return (
    <StoreShell activeNav={product.category}>
      <Suspense fallback={null}>
        <ProductOrderNotice />
      </Suspense>
      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </StoreShell>
  );
}
