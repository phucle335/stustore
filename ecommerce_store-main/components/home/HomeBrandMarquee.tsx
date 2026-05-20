import { BRAND_LOGOS } from "@/lib/store/home-content";

export function HomeBrandMarquee() {
  const logos = [...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <div className="home-brand-marquee" aria-hidden="true">
      <div className="home-brand-marquee-track">
        {logos.map((brand, index) => (
          <span key={`${brand}-${index}`} className="home-brand-logo">
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}
