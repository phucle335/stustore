import Image from "next/image";

export function HomeBrandShowcase() {
  return (
    <section className="home-brand-showcase">
      <Image
        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
        alt="Không gian cửa hàng Stusport"
        fill
        className="home-brand-showcase-img"
        sizes="100vw"
      />
      <div className="home-brand-showcase-overlay" />
      <span className="home-brand-showcase-text">STUSPORT</span>
    </section>
  );
}
