import "@/styles/components/brand.css";
import Image from "next/image";
import Link from "next/link";
import {
  STUSPORT_ICON_HEIGHT,
  STUSPORT_ICON_SRC,
  STUSPORT_ICON_WIDTH,
  STUSPORT_LOGO_ALT,
} from "@/lib/brand/logo";

type StusportLogoProps = {
  className?: string;
  variant?: "mark" | "hero" | "footer";
  tone?: "on-dark" | "on-light";
  href?: string;
  priority?: boolean;
};

export function StusportLogo({
  className = "",
  variant = "mark",
  tone = "on-dark",
  href,
  priority = false,
}: StusportLogoProps) {
  const content = (
    <span
      className={`stusport-logo stusport-logo--${variant} stusport-logo--${tone} ${className}`.trim()}
      aria-label={STUSPORT_LOGO_ALT}
    >
      <span className="stusport-logo__main">
        <span className="stusport-logo__iconWrap">
          <Image
            src={STUSPORT_ICON_SRC}
            alt=""
            width={STUSPORT_ICON_WIDTH}
            height={STUSPORT_ICON_HEIGHT}
            priority={priority}
            className="stusport-logo__icon"
            aria-hidden
          />
        </span>
        <span className="stusport-logo__word" aria-hidden="true">
          <span className="stusport-logo__stu">STU</span>
          <span className="stusport-logo__sport">SPORT</span>
        </span>
        <span className="stusport-logo__rule" aria-hidden="true" />
      </span>
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
