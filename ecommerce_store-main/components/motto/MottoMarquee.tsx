import { Fragment } from "react";

export function MottoMarquee({ items }: { items: readonly string[] }) {
  return (
    <div className="motto-marquee" role="region" aria-label="Cam kết dịch vụ">
      <div className="motto-marquee-track">
        {items.map((item, index) => (
          <Fragment key={item}>
            {index > 0 ? (
              <span className="motto-marquee-dot" aria-hidden="true">
                •
              </span>
            ) : null}
            <span className="motto-marquee-item">{item}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
