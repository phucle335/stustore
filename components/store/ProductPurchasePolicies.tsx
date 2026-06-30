"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { STORE_NAME } from "@/lib/store/site";
import { SizeGuideModal } from "@/components/store/SizeGuideModal";
import styles from "@/styles/components/store/ProductDetail.module.css";

type PolicyItem = {
  icon: string;
  text: string;
  detailHref?: string;
};

type ProductPurchasePoliciesProps = {
  hasSizeGuide?: boolean;
};

const BASE_POLICIES: PolicyItem[] = [
  {
    icon: "fa-truck",
    text: "Free shipping on orders from 799k",
    detailHref: "/dieu-khoan",
  },
  {
    icon: "fa-undo",
    text: "Free returns within 7 days",
    detailHref: "/chinh-sach-doi-tra",
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

export function ProductPurchasePolicies({
  hasSizeGuide = false,
}: ProductPurchasePoliciesProps) {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const policies = useMemo<PolicyItem[]>(() => {
    if (!hasSizeGuide) {
      return BASE_POLICIES;
    }

    return [
      {
        icon: "fa-truck",
        text: "Free shipping on orders from 799k",
        detailHref: "/dieu-khoan",
      },
      {
        icon: "fa-undo",
        text: "Free returns within 7 days",
        detailHref: "/chinh-sach-doi-tra",
      },
      {
        icon: "fa-ruler",
        text: "How to Choose Your Clothing Size",
        detailHref: "#size-guide",
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
  }, [hasSizeGuide]);

  return (
    <>
      <ul className={styles.productPurchasePolicies} id="product-policies">
        {policies.map((policy) => (
          <li key={policy.text} className={styles.productPurchasePolicy}>
            <i className={`fas ${policy.icon}`} aria-hidden="true" />
            <span>
              {policy.text}
              {policy.detailHref ? (
                <>
                  {" "}
                  <Link
                    href={policy.detailHref}
                    className={styles.policyDetailLink}
                    onClick={
                      policy.detailHref === "#size-guide"
                        ? (event) => {
                            event.preventDefault();
                            setSizeGuideOpen(true);
                          }
                        : undefined
                    }
                  >
                    See details
                  </Link>
                </>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      {hasSizeGuide ? (
        <SizeGuideModal
          open={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
          sizeGuideType="clothing"
        />
      ) : null}
    </>
  );
}
