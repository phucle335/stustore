import Link from "next/link";
import { MOTTO_NAV } from "@/lib/motto/content";
import { MottoLogo } from "./MottoLogo";

export function MottoFooter() {
  return (
    <footer className="motto-footer" id="contact">
      <div className="motto-container">
        <div className="motto-footer-top">
          <MottoLogo variant="mark" className="motto-footer-logo" />
          <p className="motto-footer-tagline">
            Sneaker · Streetwear · Authentic only
          </p>
        </div>

        <div className="motto-footer-grid">
          <div>
            <p className="motto-footer-label">Navigation</p>
            <ul className="motto-footer-links">
              {MOTTO_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="motto-footer-label">Contact</p>
            <ul className="motto-footer-links">
              <li>
                <a href="mailto:support@stusport.vn">support@stusport.vn</a>
              </li>
              <li>123 Nguyễn Huệ, Q.1, TP.HCM</li>
            </ul>
          </div>
          <div className="motto-footer-newsletter">
            <p className="motto-footer-label">Newsletter</p>
            <form className="motto-footer-form">
              <input
                type="email"
                placeholder="Your email"
                aria-label="Email address"
              />
              <button type="submit" className="motto-btn motto-btn--pill">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="motto-footer-bottom">
          <p>© {new Date().getFullYear()} Stusport. All rights reserved.</p>
          <div className="motto-footer-legal">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
