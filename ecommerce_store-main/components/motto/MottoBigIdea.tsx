import Link from "next/link";
import { MottoLine, MottoReveal } from "./MottoReveal";
import { MottoLogo } from "./MottoLogo";

export function MottoBigIdea() {
  return (
    <section className="motto-big-idea" id="services">
      <div className="motto-container">
        <div className="motto-big-idea-grid">
          <div className="motto-big-idea-left">
            <p className="motto-eyebrow">(Về chúng tôi)</p>
            <MottoReveal as="h2" className="motto-big-idea-title">
              <MottoLine>Inspired From</MottoLine>
              <MottoLine>Stusport</MottoLine>
            </MottoReveal>
            <MottoReveal as="p" className="motto-body motto-big-idea-lead" splitLines={false}>
              Sneaker, streetwear, nước hoa và đồng hồ chính hãng — cam kết hàng
              thật, giao nhanh, đổi trả linh hoạt cho mọi phong cách thể thao.
            </MottoReveal>
            <div className="motto-big-idea-wordmark">
              <MottoLogo />
            </div>
          </div>

          <div className="motto-big-idea-right">
            <MottoReveal as="h3" className="motto-big-idea-sub">
              <MottoLine>
                Stusport — điểm đến cho sneaker, streetwear và phụ kiện
              </MottoLine>
              <MottoLine>thể thao chính hãng tại Việt Nam.</MottoLine>
            </MottoReveal>
            <MottoReveal as="p" className="motto-body" splitLines={false}>
              Từ giày limited đến quần áo training, nước hoa và đồng hồ — mọi
              sản phẩm đều được tuyển chọn kỹ, cam kết authentic và trải nghiệm
              mua sắm trọn vẹn.
            </MottoReveal>

            <p className="motto-eyebrow motto-big-idea-purpose">
              (DANH MỤC NỔI BẬT)
            </p>

            <ul className="motto-link-list">
              <li>
                <Link href="/sneakers" className="motto-btn-link">
                  <span>Xem Sneaker</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link href="#work" className="motto-btn-link">
                  <span>Khám phá bộ sưu tập</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link href="/ho-tro" className="motto-btn-link">
                  <span>Hỗ trợ khách hàng</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
