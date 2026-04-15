import { useEffect, useState } from "react";
import { PwcPoweredBy } from "./PwcPoweredBy";
import "./ReviewLaunchScreen.css";

const STATUS_LINES = [
  "Loading the static analysis engine…",
  "Mapping WCAG checks to Lightning patterns…",
  "Your markup stays in this browser — nothing uploaded by default.",
] as const;

function IconCheckCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" opacity="0.35" />
      <path d="M8.5 12.2l2.2 2.2L15.8 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ReviewLaunchScreen() {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    document.body.dataset.appView = "scroll";
    return () => {
      delete document.body.dataset.appView;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLineIndex((n) => (n + 1) % STATUS_LINES.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const logoSrc = `${import.meta.env.BASE_URL}logo.svg`;

  return (
    <div className="rls" role="status" aria-live="polite" aria-busy="true" aria-label="Loading review console">
      <div className="rls-backdrop" aria-hidden />
      <div className="rls-card-shell">
        <PwcPoweredBy variant="dark" layout="stacked" className="rls-pwc" />
        <div className="rls-card">
          <img className="rls-logo" src={logoSrc} alt="" width={56} height={56} decoding="async" />
          <p className="rls-brand">LIGHTNING A11Y LAB</p>
          <h1 className="rls-title">Preparing your review console</h1>

          <p className="rls-a11y">
            <IconCheckCircle />
            Client-side scan
          </p>

          <div className="rls-scanner" aria-hidden>
            <div className="rls-scanner-frame">
              <div className="rls-scanner-line" />
              <div className="rls-scanner-lines">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          <div className="rls-pulse-row" aria-hidden>
            <span className="rls-pulse-dot" />
            <span className="rls-pulse-dot" />
            <span className="rls-pulse-dot" />
          </div>

          <p className="rls-status" key={lineIndex}>
            {STATUS_LINES[lineIndex]}
          </p>

          <div className="rls-progress" aria-hidden>
            <div className="rls-progress-indeterminate" />
          </div>

          <p className="rls-hint">
            Tip: paste LWC or Aura markup, choose WCAG level and version, then run analysis. Exports stay on your
            machine.
          </p>
        </div>
      </div>
    </div>
  );
}
