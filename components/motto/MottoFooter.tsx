import Link from "next/link";
import styles from "@/styles/components/motto/MottoFooter.module.css";
import { MOTTO_NAV } from "@/lib/motto/content";
import { MottoLogo } from "./MottoLogo";
import { FooterContact } from "@/components/store/FooterContact";

export function MottoFooter() {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <MottoLogo variant="mark" className={styles.footerLogo} />
          <p className={styles.footerTagline}>
            Sneaker · Streetwear · Authentic only
          </p>
        </div>

        <div className={styles.footerGrid}>
          <div>
            <p className={styles.footerLabel}>Navigation</p>
            <ul className={styles.footerLinks}>
              {MOTTO_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={styles.footerLabel}>Contact</p>
            <FooterContact
              compact
              zaloPhoneDigits="0901234567"
              email="stusport22@gmail.com"
            />
          </div>
          <div className={styles.footerNewsletter}>
            <p className={styles.footerLabel}>Newsletter</p>
            <form className={styles.footerForm}>
              <input
                type="email"
                placeholder="Your email"
                aria-label="Email address"
              />
              <button type="submit" className={`${styles.btn} ${styles.btnPill}`}>
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Stusport</p>
          <div className={styles.footerLegal}>
            <Link href="/dieu-khoan">Terms</Link>
            <Link href="/ho-tro">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
