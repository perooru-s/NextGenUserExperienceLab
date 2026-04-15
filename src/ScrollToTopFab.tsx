import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./ScrollToTopFab.css";

const ROUTES = new Set(["/", "/resources", "/contact", "/review"]);
const SHOW_AFTER_PX = 400;

/**
 * Scrolls to top when the route pathname changes — not when only the URL hash changes.
 * Otherwise in-page links (e.g. Learn & Resources “Jump to”) get cancelled by scrollTo(0).
 */
export function ScrollToTopOnRoute() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (!ROUTES.has(pathname)) return;
    if (pathname === "/" && hash) return;
    if ((pathname === "/resources" || pathname === "/contact" || pathname === "/review") && hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally omit `hash`: hash-only updates must not reset scroll
  }, [pathname]);
  return null;
}

export function ScrollToTopFab() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ROUTES.has(pathname)) {
      setVisible(false);
      return;
    }
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const scrollToTop = useCallback(() => {
    const instant =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: instant ? "auto" : "smooth" });
    const delay = instant ? 0 : 450;
    window.setTimeout(() => {
      const main = document.getElementById("top");
      if (main instanceof HTMLElement) {
        main.focus({ preventScroll: true });
      }
    }, delay);
  }, []);

  if (!ROUTES.has(pathname) || !visible) return null;

  return (
    <button type="button" className="scroll-to-top-fab" onClick={scrollToTop}>
      <span className="scroll-to-top-fab__icon" aria-hidden="true">
        ↑
      </span>
      <span>Back to top</span>
    </button>
  );
}
