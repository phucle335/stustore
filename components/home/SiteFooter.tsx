import styles from "@/styles/components/home/SiteFooter.module.css";
import Link from "next/link";
import { StusportLogo } from "@/components/brand/StusportLogo";
import { LivePresenceBar } from "@/components/store/LivePresenceBar";
import { NAV_LINKS } from "@/lib/store/navigation";
import { PAGE_ROUTES, STORE_NAME } from "@/lib/store/site";
import { FooterContact } from "@/components/store/FooterContact";

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className = "" }: SiteFooterProps) {
  return (
    <footer className={`${styles.footer} ${className}`.trim()}>
      <div className={styles.grid}>
        <div className={styles.col}>
          <p className={styles.logo}>
            <StusportLogo variant="footer" />
          </p>
          <p className={styles.text}>
            {STORE_NAME} — phân phối Sneaker, Sportswear và phụ kiện chính hãng
          </p>
          <p className={styles.text}>
           Online store
            <br />
            0901 234 567
            <br />
            support@stusport.vn
          </p>
        </div>

        <div className={styles.col}>
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

        <div className={styles.col}>
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

        <div className={styles.col}>
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

      <div className={styles.contactWrap}>
        <h3 className={styles.contactTitle}>Contact</h3>
        <FooterContact compact />
      </div>

      <LivePresenceBar />

      <div className={styles.bottom}>
        <div className={styles.social}>
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
