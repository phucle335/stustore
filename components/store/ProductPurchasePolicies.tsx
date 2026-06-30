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
    text: "Free shipping on orders from 799k",
    detailHref: "#product-policies",
  },
  {
    icon: "fa-undo",
    text: "Free returns within 14 days",
    detailHref: "#product-description",
  },
  {
    icon: "fa-percent",
    text: "0% installment from 3,000,000 VND",
    detailHref: "#product-policies",
  },
  {
    icon: "fa-credit-card",
    text: "Fast and secure online payment.",
  },
  {
    icon: "fa-shield-alt",
    text: `100% authentic. Learn more about ${STORE_NAME}`,
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
                  See details
                </Link>
              </>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
