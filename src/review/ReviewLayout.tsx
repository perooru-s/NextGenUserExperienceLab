import { useCallback, useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { PwcPoweredBy } from "../PwcPoweredBy";
import { THEMES, type ThemeId } from "../themes";
import { IconA11yResources, IconExportJson, IconExportPdf, IconExportWord, IconOverviewNav } from "./reviewUi";
import { useReviewSession } from "./ReviewSessionContext";

type ExportFormat = "json" | "docx" | "pdf";

export function ReviewLayout() {
  const {
    theme,
    setTheme,
    source,
    result,
    isReviewing,
    loadSample,
  } = useReviewSession();

  const [exportBusy, setExportBusy] = useState(false);

  const runExport = useCallback(
    async (format: ExportFormat) => {
      if (exportBusy) return;
      setExportBusy(true);
      try {
        const m = await import("../lib/exportReport");
        if (format === "json") m.exportReviewAsJson(result);
        else if (format === "pdf") m.exportReviewAsPdf(result, source);
        else await m.exportReviewAsDocx(result, source);
      } catch (err) {
        console.error(err);
        window.alert("Export failed. Try another format or check the browser console for details.");
      } finally {
        setExportBusy(false);
      }
    },
    [exportBusy, result, source]
  );

  const lastRunLabel = useMemo(() => new Date(result.meta.analyzedAt).toLocaleString(), [result.meta.analyzedAt]);

  return (
    <div id="top" className="app app-layout" tabIndex={-1}>
      <div className="review-chrome">
        <header className="top-bar">
          <div className="top-bar-left">
            <img
              className="brand-logo"
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt=""
              width={40}
              height={40}
              decoding="async"
            />
            <div className="top-bar-brand-block">
              <div className="top-bar-titles">
                <span className="product-name">Lightning A11y Lab</span>
                <h1 className="page-title">Review</h1>
              </div>
              <div className="top-bar-subbrand">
                <PwcPoweredBy variant="dark" layout="stacked" className="review-top-bar-pwc" />
              </div>
            </div>
          </div>
          <div className="top-bar-right">
            <Link className="top-bar-home-link" to="/" aria-label="Overview — return to marketing home">
              <span className="top-bar-home-link-icon-wrap" aria-hidden>
                <IconOverviewNav />
              </span>
              <span className="top-bar-home-link-label">Overview</span>
            </Link>
            <Link
              className="top-bar-resources-link"
              to="/resources"
              aria-label="Accessibility tools and references (opens resources page)"
            >
              <span className="top-bar-resources-link-icon-wrap" aria-hidden>
                <IconA11yResources />
              </span>
              <span className="top-bar-resources-link-label">A11y resources</span>
            </Link>
            <label className="theme-picker" htmlFor="theme-select">
              <span className="field-label theme-picker-label">Theme</span>
              <select
                id="theme-select"
                className="theme-select"
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
          </div>
        </header>

        <div className="page-toolbar">
          <p className="page-toolbar-meta">
            <span className="page-toolbar-meta-label">Last run:</span> {lastRunLabel}
          </p>
          <div className="page-toolbar-actions">
            <div className="export-buttons" role="group" aria-label="Export report">
              <span className="field-label export-buttons-label">Export</span>
              <div className="export-buttons-row">
                <button
                  type="button"
                  className="btn btn-export"
                  disabled={exportBusy}
                  aria-busy={exportBusy}
                  onClick={() => void runExport("json")}
                >
                  <IconExportJson />
                  JSON
                </button>
                <button
                  type="button"
                  className="btn btn-export"
                  disabled={exportBusy}
                  aria-busy={exportBusy}
                  onClick={() => void runExport("docx")}
                >
                  <IconExportWord />
                  Word
                </button>
                <button
                  type="button"
                  className="btn btn-export"
                  disabled={exportBusy}
                  aria-busy={exportBusy}
                  onClick={() => void runExport("pdf")}
                >
                  <IconExportPdf />
                  PDF
                </button>
              </div>
            </div>
            <div className="sample-load-group" role="group" aria-label="Load demo markup into the editor">
              <span className="field-label sample-load-group-label">Samples</span>
              <div className="sample-load-row">
                <button
                  type="button"
                  className="btn btn-outline sample-load-btn"
                  disabled={isReviewing}
                  onClick={() => loadSample("issues")}
                >
                  Issues (UX · a11y · mobile · SLDS)
                </button>
                <button
                  type="button"
                  className="btn btn-outline sample-load-btn"
                  disabled={isReviewing}
                  onClick={() => loadSample("clean")}
                >
                  Clean (no violations)
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="page-tagline">Internal static checks for LWC & Aura markup — built for developers and QA</p>
      </div>

      <Outlet />

      <footer className="footer footer-bar">
        <p>
          Runs in the browser — no data leaves your machine. Plug in an LLM or other services for deeper review in production.
        </p>
      </footer>
    </div>
  );
}
