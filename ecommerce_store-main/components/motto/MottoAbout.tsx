import Link from "next/link";
import Image from "next/image";
import { MottoLine, MottoReveal } from "./MottoReveal";

export function MottoAbout() {
  return (
    <section className="motto-about" id="about">
      <div className="motto-container">
        <MottoReveal as="h2" className="motto-about-title" splitLines={false}>
          Về Stusport
        </MottoReveal>

        <div className="motto-about-grid">
          <div className="motto-about-card">
            <div className="motto-about-card-media">
              <Image
                src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <p className="motto-about-card-label">Showroom TP.HCM</p>
          </div>
          <div className="motto-about-card">
            <div className="motto-about-card-media">
              <Image
                src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <p className="motto-about-card-label">Cửa hàng trực tuyến</p>
          </div>
        </div>

        <MottoReveal as="p" className="motto-body motto-about-text" splitLines={false}>
          123 Nguyễn Huệ, Quận 1, TP.HCM · 0901 234 567 · support@stusport.vn
        </MottoReveal>

        <Link href="/ho-tro" className="motto-btn-link">
          <span>Liên hệ Stusport</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
