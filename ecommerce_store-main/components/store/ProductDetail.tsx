import Link from "next/link";
import {
  getCategoryBackLink,
  getRelatedProductsByBrand,
} from "@/lib/store/catalog";
import type { ProductDetail as ProductDetailType } from "@/lib/store/catalog";
import { ProductDescriptionTabs } from "./ProductDescriptionTabs";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductPurchaseBlock } from "./ProductPurchaseBlock";
import { ProductRelatedByBrand } from "./ProductRelatedByBrand";

type ProductDetailProps = {
  product: ProductDetailType;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const backLink = getCategoryBackLink(product.category);
  const relatedProducts = getRelatedProductsByBrand(
    product.id,
    product.brand,
    8,
  );

  return (
    <section className="product-detail">
      <Link href={backLink.href} className="product-detail-back">
        <i className="fas fa-arrow-left" aria-hidden="true" />
        Quay lại {backLink.label}
      </Link>

      <div className="product-detail-grid">
        <ProductImageGallery
          images={product.images}
          imageAlt={product.imageAlt}
        />

        <div className="product-detail-info">
          <p className="brand">{product.brand}</p>
          <h1 className="product-detail-title">{product.name}</h1>
          <div className="price-box product-detail-price">
            <span className="price">{product.price}</span>
            {product.oldPrice ? (
              <span className="old-price">{product.oldPrice}</span>
            ) : null}
          </div>
          <ProductPurchaseBlock product={product} />
        </div>
      </div>

      <ProductDescriptionTabs product={product} />
      <ProductRelatedByBrand brand={product.brand} products={relatedProducts} />
    </section>
  );
}
