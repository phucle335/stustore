import Link from "next/link";
import { TERMS_SECTIONS } from "@/lib/store/terms-content";
import { STORE_NAME } from "@/lib/store/site";

export function TermsContent() {
  return (
    <article className="static-page">
      <h1 className="static-page-title">Điều khoản và Điều kiện</h1>
      <p className="static-page-intro">
        Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng website{" "}
        <strong>{STORE_NAME}</strong>.
      </p>

      <nav className="terms-toc" aria-label="Mục lục">
        <p className="terms-toc-title">Nội dung</p>
        <ol>
          {TERMS_SECTIONS.map((section) => (
            <li key={section.id}>
              <Link href={`#${section.id}`}>{section.title}</Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="terms-sections">
        {TERMS_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="terms-section">
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
