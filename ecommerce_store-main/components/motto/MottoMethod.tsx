import Link from "next/link";
import { MottoLine, MottoReveal } from "./MottoReveal";

export function MottoMethodMarquee() {
  const words = Array.from({ length: 12 }, () => "STUSPORT");
  const items = [...words, ...words];

  return (
    <div className="motto-method-marquee-wrap" aria-hidden>
      <div className="motto-method-marquee">
        {items.map((word, i) => (
          <span key={i} className="motto-method-marquee-word">
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MottoMethod() {
  return (
    <section className="motto-method" id="method">
      <MottoMethodMarquee />
      <div className="motto-container">
        <MottoReveal as="h2" className="motto-method-title">
          <MottoLine>Cam kết</MottoLine>
          <MottoLine>chất lượng.</MottoLine>
        </MottoReveal>
        <MottoReveal as="p" className="motto-body motto-method-text" splitLines={false}>
          Hàng chính hãng, miễn phí giao hàng đơn từ 799k và đổi trả đến 14
          ngày — Stusport đặt trải nghiệm khách hàng lên hàng đầu trong mọi đơn
          hàng.
        </MottoReveal>
        <Link href="/ho-tro" className="motto-btn-link motto-method-link">
          <span>Xem chính sách hỗ trợ</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
