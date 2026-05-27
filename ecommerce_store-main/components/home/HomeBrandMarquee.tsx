import { PARTNER_BRAND_LOGO_URLS } from "@/lib/motto/content";

export function HomeBrandMarquee() {
  const logos = [...PARTNER_BRAND_LOGO_URLS, ...PARTNER_BRAND_LOGO_URLS];

  return (
    <div className="home-brand-marquee" aria-label="Thương hiệu đối tác">
      <div className="home-brand-marquee-track">
        {logos.map((src, index) => (
          <div key={`${src}-${index}`} className="home-brand-marquee-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" decoding="async" />
          </div>
        ))}
      </div>
    </div>
  );
}
