import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import "./AccessGate.css";

const AUTH_KEY = "lightning-a11y-lab-site-auth";

/** Set at build time (e.g. GitHub Actions secret). Empty = no gate (local dev). */
const sitePassword = (import.meta.env.VITE_SITE_PASSWORD ?? "").trim();

function readUnlocked(): boolean {
  try {
    return sessionStorage.getItem(AUTH_KEY) === "1";
  } catch {
    return false;
  }
}

export function AccessGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => (sitePassword ? readUnlocked() : true));
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const formId = useId();

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (password === sitePassword) {
        try {
          sessionStorage.setItem(AUTH_KEY, "1");
        } catch {
          /* ignore quota / private mode */
        }
        setUnlocked(true);
        setError(false);
        return;
      }
      setError(true);
    },
    [password, sitePassword]
  );

  useEffect(() => {
    if (sitePassword && !unlocked) {
      document.body.dataset.appView = "scroll";
      return () => {
        delete document.body.dataset.appView;
      };
    }
  }, [sitePassword, unlocked]);

  if (!sitePassword || unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="access-gate">
      <div className="access-gate-card">
        <h1 className="access-gate-title">Lightning A11y Lab</h1>
        <p className="access-gate-lead">Enter the team password to continue.</p>
        <form className="access-gate-form" onSubmit={onSubmit} noValidate>
          <label className="access-gate-label" htmlFor={`${formId}-pw`}>
            Password
          </label>
          <input
            id={`${formId}-pw`}
            className="access-gate-input"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            aria-invalid={error}
            aria-describedby={error ? `${formId}-err` : undefined}
          />
          {error && (
            <p id={`${formId}-err`} className="access-gate-error" role="alert">
              That password is not correct.
            </p>
          )}
          <button type="submit" className="access-gate-submit">
            Open app
          </button>
        </form>
        <p className="access-gate-note">
          This check runs in the browser only—it keeps casual visitors out, not determined attackers. For stronger
          protection, use a private GitHub repo with Pages access control, or a service such as Cloudflare Access in
          front of the site.
        </p>
      </div>
    </div>
  );
}
