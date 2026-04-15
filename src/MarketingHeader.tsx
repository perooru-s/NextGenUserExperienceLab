import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PwcPoweredBy } from "./PwcPoweredBy";
import { applyTheme, readStoredTheme, THEMES, type ThemeId } from "./themes";
import "./MarketingHeader.css";

const LANDING_SECTION_HASHES = new Set(["#product", "#team", "#faq"]);

export function MarketingHeader() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<ThemeId>(() => readStoredTheme());

  const homeNavActive = useMemo(
    () => pathname === "/" && (!hash || !LANDING_SECTION_HASHES.has(hash)),
    [pathname, hash]
  );

  /** On Learn & Resources, clicking the nav link again scrolls to top (same route). */
  const handleResourcesOnPage = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (pathname !== "/resources") return;
      e.preventDefault();
      const instant =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
    },
    [pathname]
  );

  /** On the contact page, Contact nav should scroll to top (same route). */
  const handleContactOnPage = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (pathname !== "/contact") return;
      e.preventDefault();
      const instant =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
    },
    [pathname]
  );

  /** On the marketing home page, logo / Home should scroll to top (and drop #anchors from the URL). */
  const handleHomeOnLanding = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (pathname !== "/") return;
      e.preventDefault();
      const instant =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
      if (hash) {
        navigate({ pathname: "/" }, { replace: true });
      }
    },
    [pathname, hash, navigate]
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const logoSrc = `${import.meta.env.BASE_URL}logo.svg`;

  return (
    <header className="mk-header">
      <div className="mk-wrap mk-inner">
        <a href="#top" className="mk-skip-link">
          Skip to main content
        </a>
        <div className="mk-brand-block">
          <Link to="/" className="mk-brand" onClick={handleHomeOnLanding}>
            <img className="mk-logo" src={logoSrc} alt="" width={40} height={40} decoding="async" />
            <span className="mk-brand-text">LIGHTNING A11Y LAB</span>
          </Link>
          <div className="mk-subbrand">
            <PwcPoweredBy variant="dark" layout="stacked" className="mk-header-pwc" />
          </div>
        </div>
        <nav className="mk-nav" aria-label="Primary">
          <Link className={`mk-nav-link ${homeNavActive ? "mk-nav-link--active" : ""}`} to="/" onClick={handleHomeOnLanding}>
            Home
          </Link>
          <Link
            className={`mk-nav-link ${pathname === "/" && hash === "#product" ? "mk-nav-link--active" : ""}`}
            to="/#product"
            preventScrollReset
          >
            Product
          </Link>
          <Link
            className={`mk-nav-link ${pathname === "/" && hash === "#team" ? "mk-nav-link--active" : ""}`}
            to="/#team"
            preventScrollReset
          >
            Team
          </Link>
          <Link
            className={`mk-nav-link ${pathname === "/" && hash === "#faq" ? "mk-nav-link--active" : ""}`}
            to="/#faq"
            preventScrollReset
          >
            FAQ
          </Link>
          <Link
            className={`mk-nav-link ${pathname === "/resources" ? "mk-nav-link--active" : ""}`}
            to="/resources"
            onClick={handleResourcesOnPage}
          >
            Learn &amp; Resources
          </Link>
          <Link
            className={`mk-nav-link ${pathname === "/contact" ? "mk-nav-link--active" : ""}`}
            to="/contact"
            onClick={handleContactOnPage}
          >
            Contact
          </Link>
        </nav>
        <div className="mk-actions">
          <label className="mk-theme">
            <span className="mk-theme-label">Theme</span>
            <select
              className="mk-theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeId)}
              aria-label="Color theme"
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <Link className="mk-btn-launch" to="/review">
            Launch tool
          </Link>
        </div>
      </div>
    </header>
  );
}
