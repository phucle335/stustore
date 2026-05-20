import { SupportFaq } from "@/components/support/SupportFaq";
import { StoreShell } from "@/components/store/StoreShell";
import { STORE_NAME } from "@/lib/store/site";

export const metadata = {
  title: `Hỗ trợ và giải đáp thắc mắc — ${STORE_NAME}`,
};

export default function SupportPage() {
  return (
    <StoreShell activeNav="home">
      <div className="static-page-wrap">
        <article className="static-page">
          <h1 className="static-page-title">Hỗ trợ và giải đáp thắc mắc</h1>
          <p className="static-page-intro">
            Tìm câu trả lời nhanh về đặt hàng, thanh toán, giao nhận và đổi trả
            tại {STORE_NAME}.
          </p>
          <SupportFaq />
        </article>
      </div>
    </StoreShell>
  );
}
