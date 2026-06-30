import { STORE_NAME } from "./site";

export type SupportCategoryId =
  | "ordering"
  | "payment"
  | "delivery"
  | "returns"
  | "account"
  | "contact";

export type SupportFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type SupportCategory = {
  id: SupportCategoryId;
  label: string;
  icon: string;
  items: SupportFaqItem[];
};

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  {
    id: "ordering",
    label: "Ordering",
    icon: "fa-shopping-cart",
    items: [
      {
        id: "order-how",
        question: "How do I place an order?",
        answer: `Select product → choose size (if applicable) → click BUY NOW or add to cart → complete shipping information and payment. ${STORE_NAME} will confirm your order via email or message.`,
      },
      {
        id: "order-cancel",
        question: "How do I cancel a placed order?",
        answer:
          "Contact hotline 0901 234 567 or email support@stusport.vn within 2 hours of ordering (before order status changes to shipping). Orders already handed to shipping cannot be cancelled — you may refuse delivery or request a return within 7 days.",
      },
      {
        id: "order-track",
        question: "How do I track my order?",
        answer:
          "Use your order code from the confirmation email and contact customer service. We will send the tracking number when your package is handed to the shipping carrier.",
      },
    ],
  },
  {
    id: "payment",
    label: "Payment",
    icon: "fa-credit-card",
    items: [
      {
        id: "pay-methods",
        question: "What payment methods are accepted?",
        answer:
          "Bank transfer, ATM/Visa/Mastercard, Momo/ZaloPay e-wallets (depending on period) and COD on delivery in some areas.",
      },
      {
        id: "pay-installment",
        question: "Is 0% installment available?",
        answer:
          "0% interest installment available for orders from 3,000,000đ through our banking partner (terms and duration vary by promotion).",
      },
      {
        id: "pay-failed",
        question: "What if payment fails?",
        answer:
          "Your order will remain in pending payment status. You can retry or choose a different payment method within 24 hours, after which the order may be automatically cancelled.",
      },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: "fa-truck",
    items: [
      {
        id: "ship-time",
        question: "How long will I receive my order?",
        answer:
          "Ho Chi Minh City downtown: 2–3 business days. Other provinces: 3–7 business days. Delivery may take longer during sale seasons or bad weather.",
      },
      {
        id: "ship-fee",
        question: "What are the shipping fees?",
        answer:
          "Free shipping for orders from 799,000đ. Orders below this amount have shipping fees based on area (usually 30,000–50,000đ for downtown areas).",
      },
      {
        id: "ship-address",
        question: "Can I change my delivery address after ordering?",
        answer:
          "Yes, if your order has not been handed to the shipping carrier. Please call our hotline immediately to update.",
      },
    ],
  },
  {
    id: "returns",
    label: "Returns & Warranty",
    icon: "fa-sync-alt",
    items: [
      {
        id: "return-policy",
        question: "What is the return policy for website purchases?",
        answer: `Free returns within 7 days, product must have original tags/packaging and be unused. ${STORE_NAME} guarantees 100% genuine products.`,
      },
      {
        id: "return-time",
        question: "How long does the return process take?",
        answer:
          "Return requests must be submitted within 7 days of receiving the item. After we receive the returned item, we will process size/exchange or refund within 3–7 business days.",
      },
      {
        id: "warranty",
        question: "What is the warranty policy?",
        answer:
          "Products with manufacturer defects are warranted according to the brand's warranty terms/invoice. Stusport assists with warranty claims and forwards them to the genuine supplier.",
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    icon: "fa-user",
    items: [
      {
        id: "acc-login",
        question: "Do I need to register an account?",
        answer:
          "You can purchase as a guest using email or phone number. Signing in with Google/Facebook helps save order history and receive member offers.",
      },
      {
        id: "acc-forgot",
        question: "What if I forgot my password?",
        answer:
          "Use the forgot password function on the sign-in page or contact support@stusport.vn for verification assistance.",
      },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    icon: "fa-comments",
    items: [
      {
        id: "contact-info",
        question: "How do I contact Stusport?",
        answer:
          "Hotline: 0901 234 567 · Email: support@stusport.vn · Address: 123 Nguyen Hue, Q.1, Ho Chi Minh City · Support: 09:00–22:00 daily.",
      },
      {
        id: "contact-form",
        question: "Where can I submit a support request?",
        answer:
          "Call our hotline, email support@stusport.vn, or message through our official Facebook/Zalo page.",
      },
    ],
  },
];
