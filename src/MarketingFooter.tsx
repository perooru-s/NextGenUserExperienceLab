import { useCallback, type MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import "./MarketingFooter.css";

export function MarketingFooter() {
  const { pathname } = useLocation();

  const handleFooterContactClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (pathname !== "/contact") return;
      e.preventDefault();
      const instant =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
    },
    [pathname]
  );

  const handleFooterResourcesClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (pathname !== "/resources") return;
      e.preventDefault();
      const instant =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
    },
    [pathname]
  );

  const handleFooterAboutClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (pathname !== "/") return;
      e.preventDefault();
      const instant =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
    },
    [pathname]
  );

  return (
    <footer className="lp-footer">
      <div className="lp-wrap lp-footer-grid">
        <div className="lp-footer-col">
          <h3 className="lp-footer-heading">Product</h3>
          <ul className="lp-footer-list">
            <li>
              <Link to="/review">Review console</Link>
            </li>
            <li>
              <Link to="/#product" preventScrollReset>
                Capabilities
              </Link>
            </li>
            <li>
              <Link to="/#faq" preventScrollReset>
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div className="lp-footer-col">
          <h3 className="lp-footer-heading">Learn &amp; Resources</h3>
          <ul className="lp-footer-list">
            <li>
              <Link to="/resources" onClick={handleFooterResourcesClick}>
                Accessibility tools &amp; references
              </Link>
            </li>
            <li>
              <Link to="/#impact" preventScrollReset>
                Compliance impact
              </Link>
            </li>
            <li>
              <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank" rel="noopener noreferrer">
                WCAG overview
              </a>
            </li>
            <li>
              <a href="https://www.lightningdesignsystem.com/" target="_blank" rel="noopener noreferrer">
                SLDS
              </a>
            </li>
          </ul>
        </div>
        <div className="lp-footer-col">
          <h3 className="lp-footer-heading">Company</h3>
          <ul className="lp-footer-list">
            <li>
              <Link to="/" onClick={handleFooterAboutClick}>
                About
              </Link>
            </li>
            <li>
              <Link to="/#team" preventScrollReset>
                Team
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={handleFooterContactClick}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div className="lp-footer-brand">
          <span className="lp-footer-logo-text">LIGHTNING A11Y LAB</span>
          <p className="lp-footer-tag">Experience quality for Lightning UI</p>
          <div className="lp-footer-social" aria-label="Social">
            <a href="#top" className="lp-social" aria-label="LinkedIn (placeholder)">
              in
            </a>
            <a href="#top" className="lp-social" aria-label="X (placeholder)">
              X
            </a>
          </div>
        </div>
      </div>
      <div className="lp-footer-bar">
        <div className="lp-wrap lp-footer-bar-inner">
          <p className="lp-copyright">© {new Date().getFullYear()} LIGHTNING A11Y LAB. All rights reserved.</p>
          <div className="lp-legal">
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
            <a href="#top">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
