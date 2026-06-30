import styles from "@/styles/components/store/StoreStatic.module.css";

const RETURN_POLICY_SECTIONS = [
  {
    id: "return-conditions",
    title: "1. Return & Exchange Conditions",
    paragraphs: [
      "Customers must inspect the product condition at the time of delivery and may exchange/return items in the following cases:",
      "– The product does not match the type, style, or description in the order or on the website at the time of purchase.",
      "– Insufficient quantity or incomplete set as ordered.",
      "– External condition is damaged such as torn packaging, peeling, broken items…",
      "– Customers are responsible for providing relevant documentation proving the above deficiencies to complete the return/exchange.",
      "– Customers may exchange Size within 7 days from the date of receiving the shoes.",
      "– In case the customer wants to exchange for a different product, the new product must have a price equal to or higher than the purchased product (If the price is lower, Stusport will not refund and transfer that amount as a Voucher).",
    ],
  },
  {
    id: "time-requirements",
    title: "2. Time Requirements for Notification and Product Return",
    paragraphs: [
      "Return notification time: Within 48 hours from receipt of product for cases of missing accessories, gifts, or breakage.",
      "Product return shipment time: Within 7 days from receipt of product.",
      "Return location: Customers can bring items directly to our office/store or send them via postal service.",
      "In case customers have feedback/complaints regarding product quality, please contact our customer service hotline.",
    ],
  },
  {
    id: "warranty-policy",
    title: "3. Product Warranty Policy",
    paragraphs: [
      "Stusport guarantees all products are 100% authentic!",
      "During use, if product issues caused by manufacturing defects are discovered. Warranty period is within 06 months from the date of purchase (only covering defects such as peeling glue, loose stitching).",
      "Note: If customers unilaterally alter, repair, or modify the product, or fail to follow proper storage and usage methods resulting in product damage, Stusport will not be responsible for warranty claims.",
    ],
  },
  {
    id: "exchange-refund",
    title: "4. Exchange and Refund Policy",
    paragraphs: [
      "Stusport exchanges products within 7 days from the date customer receives the item. Stusport only exchanges unused items in original condition (original box, tags, labels, invoice, warranty card, …).",
      "For order items, the order will be cancelled within 20 days from the shoe arrival date if the customer does not complete payment. Stusport will not be responsible for the customer's deposit under any circumstances.",
      "Stusport provides 100% refund if customers discover products are not authentic or do not match the promised quality.",
      "For all warranty and exchange information, please contact Stusport customer service department.",
    ],
  },
];

export function ReturnPolicyContent() {
  return (
    <>
      <h1 className={styles.staticPageTitle}>Return Policy</h1>
      <p className={styles.staticPageIntro}>
        We want you to be completely satisfied with your purchase. Please read our
        return and exchange policy below.
      </p>

      <div className={styles.termsSections}>
        {RETURN_POLICY_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className={styles.termsSection}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
