import Link from "next/link";

type StusportLogoProps = {
  className?: string;
  variant?: "mark" | "hero" | "footer";
  href?: string;
};

export function StusportLogo({
  className = "",
  variant = "mark",
  href,
}: StusportLogoProps) {
  const content = (
    <span
      className={`stusport-logo stusport-logo--${variant} ${className}`.trim()}
      aria-label="Stusport"
    >
      <span className="stusport-logo-stu">Stu</span>
      <span className="stusport-logo-sport">sport</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="stusport-logo-link">
        {content}
      </Link>
    );
  }

  return content;
}
