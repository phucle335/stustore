import Link from "next/link";
import { StusportLogo } from "@/components/brand/StusportLogo";
import { LivePresenceBar } from "@/components/store/LivePresenceBar";
import { NAV_LINKS } from "@/lib/store/navigation";
import { PAGE_ROUTES, STORE_NAME } from "@/lib/store/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-col">
          <p className="site-footer-logo">
            <StusportLogo variant="footer" />
          </p>
          <p className="site-footer-text">
            {STORE_NAME} — Cửa hàng sneaker, streetwear, kính mát và đồng hồ
            chính hãng.
          </p>
          <p className="site-footer-text">
            123 Nguyễn Huệ, Quận 1, TP.HCM
            <br />
            0901 234 567
            <br />
            support@stusport.vn
          </p>
        </div>

        <div className="site-footer-col">
          <h3>Về {STORE_NAME}</h3>
          <ul>
            <li>
              <Link href="/">Giới thiệu</Link>
            </li>
            <li>
              <Link href={PAGE_ROUTES.terms}>Điều khoản và Điều kiện</Link>
            </li>
            <li>
              <Link href="#">Hệ thống cửa hàng</Link>
            </li>
          </ul>
        </div>

        <div className="site-footer-col">
          <h3>Hỗ trợ khách hàng</h3>
          <ul>
            <li>
              <Link href={PAGE_ROUTES.support}>
                Hỗ trợ và giải đáp thắc mắc
              </Link>
            </li>
            <li>
              <Link href={PAGE_ROUTES.terms}>Chính sách đổi trả</Link>
            </li>
            <li>
              <Link href={PAGE_ROUTES.terms}>Chính sách vận chuyển</Link>
            </li>
            <li>
              <Link href="#">Hướng dẫn mua hàng</Link>
            </li>
          </ul>
        </div>

        <div className="site-footer-col">
          <h3>Danh mục</h3>
          <ul>
            {NAV_LINKS.filter(
              (link) => link.id !== "home" && link.id !== "blog",
            ).map((link) => (
              <li key={link.id}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <LivePresenceBar />

      <div className="site-footer-bottom">
        <div className="site-footer-social">
          <a href="#" aria-label="Facebook">
            <i className="fab fa-facebook-f" />
          </a>
          <a href="#" aria-label="Instagram">
            <i className="fab fa-instagram" />
          </a>
          <a href="#" aria-label="YouTube">
            <i className="fab fa-youtube" />
          </a>
          <a href="#" aria-label="TikTok">
            <i className="fab fa-tiktok" />
          </a>
        </div>
        <p>© {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}
