import Link from "next/link";
import { StoreShell } from "@/components/store/StoreShell";
import staticStyles from "@/styles/components/store/StoreStatic.module.css";

export default function ProductNotFound() {
  return (
    <StoreShell activeNav="sneakers">
      <section className={staticStyles.searchEmpty} style={{ padding: "48px 24px" }}>
        <h1 style={{ marginBottom: 12 }}>Product Not Found</h1>
        <p style={{ marginBottom: 24 }}>
          This product does not exist or has been removed. Please return to the category page.
        </p>
        <Link href="/sneakers">View Sneakers</Link>
      </section>
    </StoreShell>
  );
}
