import Link from "next/link";
import { formatBrandDisplay } from "@/lib/store/brands";
import { getCategoryBackLink } from "@/lib/store/catalog";
import type { ProductDetail as ProductDetailType } from "@/lib/store/catalog";
import { FavoriteButton } from "./FavoriteButton";
import { ProductDescriptionTabs } from "./ProductDescriptionTabs";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductPurchaseBlock } from "./ProductPurchaseBlock";
import { ProductRelatedByBrand } from "./ProductRelatedByBrand";
import styles from "@/styles/components/store/ProductDetail.module.css";

type ProductDetailProps = {
  product: ProductDetailType;
  relatedProducts?: ProductDetailType[];
};

export function ProductDetail({
  product,
  relatedProducts = [],
}: ProductDetailProps) {
  const backLink = getCategoryBackLink(product.category);
  const brandLabel = formatBrandDisplay(product.brand);

  return (
    <section className={styles.productDetail}>
      <nav className={styles.productDetailBreadcrumb} aria-label="Breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <Link href={backLink.href}>{backLink.label}</Link>
      </nav>

      <Link href={backLink.href} className={styles.productDetailBack}>
        <i className="fas fa-arrow-left" aria-hidden="true" />
        Quay lại cửa hàng
      </Link>

      <div className={styles.productDetailGrid}>
        <ProductImageGallery
          images={product.images}
          imageAlt={product.imageAlt}
        />

        <div className={styles.productDetailInfo}>
          <p className={styles.productDetailBrand}>{brandLabel}</p>
          <div className={styles.productDetailTitleRow}>
            <h1 className={styles.productDetailTitle}>{product.name}</h1>
            <FavoriteButton productId={product.id} />
          </div>
          <div className={styles.productDetailPrice}>
            <span className={styles.productDetailPriceValue}>{product.price}</span>
            {product.oldPrice ? (
              <span className={styles.productDetailPriceOld}>{product.oldPrice}</span>
            ) : null}
          </div>
          {product.fulfillmentType === "pre_order" ? (
            <p className={styles.productDetailBadge}>Pre-order</p>
          ) : null}
          <ProductPurchaseBlock product={product} />
        </div>
      </div>

      <ProductDescriptionTabs product={product} />
      <ProductRelatedByBrand
        brand={product.brand}
        categoryHref={backLink.href}
        products={relatedProducts}
      />
    </section>
  );
}
