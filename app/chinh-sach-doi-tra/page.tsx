import "@/styles/pages/dieu-khoan.css";
import { StoreShell } from "@/components/store/StoreShell";
import { StaticPageShell } from "@/components/store/StaticPageShell";
import { ReturnPolicyContent } from "@/components/return-policy/ReturnPolicyContent";
import { STORE_NAME } from "@/lib/store/site";

export const metadata = {
  title: `Return Policy — ${STORE_NAME}`,
};

export default async function ReturnPolicyPage() {
  return (
    <StoreShell activeNav="home">
      <StaticPageShell>
        <ReturnPolicyContent />
      </StaticPageShell>
    </StoreShell>
  );
}
