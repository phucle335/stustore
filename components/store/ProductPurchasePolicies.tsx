import Link from "next/link";
import { STORE_NAME } from "@/lib/store/site";
import styles from "@/styles/components/store/ProductDetail.module.css";

type PolicyItem = {
  icon: string;
  text: string;
  detailHref?: string;
};

const POLICIES: PolicyItem[] = [
  {
    icon: "fa-truck",
    text: "Miễn phí giao hàng đơn từ 799k",
    detailHref: "#product-policies",
  },
  {
    icon: "fa-undo",
    text: "Đổi trả miễn phí đến 14 ngày",
    detailHref: "#product-description",
  },
  {
    icon: "fa-percent",
    text: "Trả góp 0% lãi suất từ 3.000.000 VNĐ",
    detailHref: "#product-policies",
  },
  {
    icon: "fa-credit-card",
    text: "Thanh toán trực tuyến nhanh chóng và an toàn.",
  },
  {
    icon: "fa-shield-alt",
    text: `100% chính hãng. Giới thiệu về ${STORE_NAME}`,
    detailHref: "#product-about",
  },
];

export function ProductPurchasePolicies() {
  return (
    <ul className={styles.productPurchasePolicies} id="product-policies">
      {POLICIES.map((policy) => (
        <li key={policy.text} className={styles.productPurchasePolicy}>
          <i className={`fas ${policy.icon}`} aria-hidden="true" />
          <span>
            {policy.text}
            {policy.detailHref ? (
              <>
                {" "}
                <Link href={policy.detailHref} className={styles.policyDetailLink}>
                  Xem chi tiết
                </Link>
              </>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
