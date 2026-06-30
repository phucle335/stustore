
import Link from "next/link";
import { TERMS_SECTIONS } from "@/lib/store/terms-content";
import { STORE_NAME } from "@/lib/store/site";
import styles from "@/styles/components/store/StoreStatic.module.css";

export function TermsContent() {
  return (
    <>
      <h1 className={styles.staticPageTitle}>Terms & Conditions</h1>
      <p className={styles.staticPageIntro}>
        Please read the terms below carefully before using the{" "}
        <strong>{STORE_NAME}</strong> website.
      </p>

      <nav className={styles.termsToc} aria-label="Table of contents">
        <p className={styles.termsTocTitle}>Contents</p>
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
    </>
  );
}
