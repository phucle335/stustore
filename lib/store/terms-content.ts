import { STORE_NAME } from "./site";

export type TermsSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    paragraphs: [
      `${STORE_NAME} ("we", "us") provides an online shopping platform for sneakers, streetwear, accessories, fragrances, and authentic watches.`,
      `By accessing and using the website, you agree to be bound by the terms and conditions set forth in this document. If you do not agree, please stop using the service.`,
    ],
  },
  {
    id: "general-terms",
    title: "2. General Terms",
    paragraphs: [
      "Product information (images, descriptions, prices) may be updated without prior notice. Listed prices include VAT where applicable.",
      `${STORE_NAME} reserves the right to refuse or cancel orders in cases of pricing errors, product information issues, suspected fraud, or out-of-stock situations.`,
      "You agree to provide accurate and complete order information to enable delivery and post-sale support.",
    ],
  },
  {
    id: "ordering-payment",
    title: "3. Orders & Payment",
    paragraphs: [
      "Orders are confirmed once you complete the checkout steps on the website and receive email/confirmation from the system.",
      "Payment methods: bank transfer, domestic/international card, e-wallets, and COD (where supported in the delivery area).",
      "Orders may be cancelled if payment is not completed within the specified period or upon your request before the package is handed to the shipping carrier.",
    ],
  },
  {
    id: "delivery",
    title: "4. Delivery",
    paragraphs: [
      "Estimated delivery: 2–5 business days (inner city) and 3–7 days (other provinces), depending on address and shipping carrier.",
      "Free shipping for orders from 799,000đ as per the current promotion on the website.",
      "Please inspect your package upon receipt; any complaints regarding missing or damaged items must be reported within 48 hours of delivery.",
    ],
  },
  {
    id: "returns",
    title: "5. Returns & Exchanges",
    paragraphs: [
      "Free returns within 7 days of receipt for items with original tags, unused, and meeting our return policy conditions.",
      "Some categories (opened-fragrance seals, special-discounted items) may not be eligible for returns — this will be noted on the product page.",
      "Return shipping costs due to our error are covered by Stusport; exchanges for personal reasons (size/style change) may incur a shipping fee per the current rate.",
    ],
  },
  {
    id: "privacy",
    title: "6. Privacy",
    paragraphs: [
      "Your personal information is kept confidential and used only for order processing, customer support, and service improvement.",
      `${STORE_NAME} does not sell or share data with third parties for marketing purposes without your consent, except as required by law.`,
    ],
  },
  {
    id: "rights-obligations",
    title: "7. Rights & Obligations",
    paragraphs: [
      `You have the right to check order status, request support, and lodge complaints via hotline, email, or the ${STORE_NAME} Support page.`,
      "You must not use the website for illegal purposes, payment fraud, or activities that disrupt the technical system.",
    ],
  },
  {
    id: "contact",
    title: "8. Contact",
    paragraphs: [
      "Hotline: 0901 234 567 (09:00 – 22:00 daily)",
      "Email: support@stusport.vn",
      "Address: 123 Nguyen Hue, District 1, Ho Chi Minh City",
      `${STORE_NAME} reserves the right to amend these terms; updated versions will be posted on the website and take effect from the date of publication.`,
    ],
  },
];
