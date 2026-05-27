import { PARTNER_BRAND_LOGO_URLS } from "@/lib/motto/content";

export function MottoBrandMarquee() {
  const logos = [...PARTNER_BRAND_LOGO_URLS, ...PARTNER_BRAND_LOGO_URLS];

  return (
    <div className="motto-brand-marquee" aria-label="Thương hiệu đối tác">
      <div className="motto-brand-marquee-track">
        {logos.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="motto-brand-marquee-item"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" decoding="async" />
          </div>
        ))}
      </div>
    </div>
  );
}
