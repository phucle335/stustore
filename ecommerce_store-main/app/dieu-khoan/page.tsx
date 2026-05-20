import { StoreShell } from "@/components/store/StoreShell";
import { TermsContent } from "@/components/terms/TermsContent";
import { STORE_NAME } from "@/lib/store/site";

export const metadata = {
  title: `Điều khoản và Điều kiện — ${STORE_NAME}`,
};

export default function TermsPage() {
  return (
    <StoreShell activeNav="home">
      <div className="static-page-wrap">
        <TermsContent />
      </div>
    </StoreShell>
  );
}
