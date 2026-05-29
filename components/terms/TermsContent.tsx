
import Link from "next/link";
import { TERMS_SECTIONS } from "@/lib/store/terms-content";
import { STORE_NAME } from "@/lib/store/site";
import styles from "@/styles/components/store/StoreStatic.module.css";

export function TermsContent() {
  return (
    <article className={styles.staticPage}>
      <h1 className={styles.staticPageTitle}>Điều khoản và Điều kiện</h1>
      <p className={styles.staticPageIntro}>
        Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng website{" "}
        <strong>{STORE_NAME}</strong>.
      </p>

      <nav className={styles.termsToc} aria-label="Mục lục">
        <p className={styles.termsTocTitle}>Nội dung</p>
        <ol>
          {TERMS_SECTIONS.map((section) => (
            <li key={section.id}>
              <Link href={`#${section.id}`}>{section.title}</Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className={styles.termsSections}>
        {TERMS_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className={styles.termsSection}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
