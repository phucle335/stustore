import "@/styles/components/brand.css";
import Image from "next/image";
import Link from "next/link";
import {
  STUSPORT_LOGO_ALT,
  STUSPORT_LOGO_SRC,
  STUSPORT_LOGO_WIDTH,
  STUSPORT_LOGO_HEIGHT,
  STUSPORT_LOGO_SIZE_HEIGHT,
  STUSPORT_LOGO_SIZE,
} from "@/lib/brand/logo";

type StusportLogoProps = {
  className?: string;
  variant?: "mark" | "hero" | "footer";
  tone?: "on-dark" | "on-light";
  href?: string;
  size?: typeof STUSPORT_LOGO_SIZE[keyof typeof STUSPORT_LOGO_SIZE];
  priority?: boolean;
};

export function StusportLogo({
  className = "",
  variant = "mark",
  tone = "on-dark",
  href,
  size = "S",
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
            src={STUSPORT_LOGO_SRC}
            alt={STUSPORT_LOGO_ALT}
            width={STUSPORT_LOGO_WIDTH}
            height={STUSPORT_LOGO_HEIGHT}
            priority={priority}
            className="stusport-logo__icon"
            style={{
              height: `${STUSPORT_LOGO_SIZE_HEIGHT[size]}px !important`,
            }}
            aria-hidden
          />
        </span>
        {/* <span className="stusport-logo__word" aria-hidden="true">
          <span className="stusport-logo__stu">STU</span>
          <span className="stusport-logo__sport">SPORT</span>
        </span>
        <span className="stusport-logo__rule" aria-hidden="true" /> */}
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
