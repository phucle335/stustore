import styles from "@/styles/components/home/SiteFooter.module.css";
import Link from "next/link";
import { StusportLogo } from "@/components/brand/StusportLogo";
import { LivePresenceBar } from "@/components/store/LivePresenceBar";
import { NAV_LINKS } from "@/lib/store/navigation";
import { PAGE_ROUTES, STORE_NAME } from "@/lib/store/site";
import { FooterContact } from "@/components/store/FooterContact";
import { FooterMembershipCta } from "@/components/home/FooterMembershipCta";

type SiteFooterProps = {
  className?: string;
  hideMembershipCta?: boolean;
};

export function SiteFooter({ className = "", hideMembershipCta = false }: SiteFooterProps) {
  return (
    <footer className={`${styles.footer} ${className}`.trim()}>
      <div className={styles.grid}>
        <div className={styles.col}>
          <p className={styles.logo}>
            <StusportLogo variant="footer" />
          </p>
          <p className={styles.text}>
            {STORE_NAME} — distributing Sneakers, Sportswear and genuine accessories
          </p>
          <p className={styles.text}>
           Online Store
            <br />
            0901 234 567
            <br />
            stusport22@gmail.com
          </p>
        </div>

        <div className={styles.col}>
          <h3>About {STORE_NAME}</h3>
          <ul>
            <li>
              <Link href="/gioi-thieu">About Us</Link>
            </li>
            <li>
              <Link href={PAGE_ROUTES.terms}>Terms & Conditions</Link>
            </li>
            <li>
              <Link href="#">Store Locations</Link>
            </li>
          </ul>
        </div>

        <div className={styles.col}>
          <h3>Customer Support</h3>
          <ul>
            <li>
              <Link href={PAGE_ROUTES.support}>
                Help & FAQ
              </Link>
            </li>
            <li>
              <Link href="/chinh-sach-doi-tra">Return Policy</Link>
            </li>
            <li>
              <Link href={PAGE_ROUTES.terms}>Shipping Policy</Link>
            </li>
            <li>
              <Link href="#">Shopping Guide</Link>
            </li>
          </ul>
        </div>

        <div className={styles.col}>
          <h3>Categories</h3>
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

      {!hideMembershipCta && <FooterMembershipCta />}

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
