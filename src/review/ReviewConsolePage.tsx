import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { computeDimensionScores } from "../lib/dimensionScores";
import { fetchPageSource, normalizeReviewUrl } from "../lib/fetchPageSource";
import type { WcagLevel, WcagVersion } from "../types";
import { FindingsPanel } from "./FindingsPanel";
import {
  IconFetchAndRun,
  IconFetchIntoCode,
  IconRunReview,
  ResultsSpinner,
  ReviewSuccessBanner,
  ScoreOverview,
} from "./reviewUi";
import { useReviewSession } from "./ReviewSessionContext";

const WCAG_OPTIONS: { value: WcagLevel; label: string; hint: string }[] = [
  { value: "A", label: "Level A", hint: "Baseline WCAG requirements" },
  { value: "AA", label: "Level AA", hint: "Common legal & enterprise standard" },
  { value: "AAA", label: "Level AAA", hint: "Strictest; partial AAA is normal" },
];

const VERSION_OPTIONS: { value: WcagVersion; label: string; hint: string }[] = [
  { value: "2.2", label: "WCAG 2.2", hint: "Includes 2.5.8, focus appearance, etc." },
  { value: "2.1", label: "WCAG 2.1", hint: "Older baseline; no AA 2.5.8" },
];

type SourceInputMode = "markup" | "url";

/** Review console: source panel first; findings stack below after Run Review or Fetch & Run. */
export function ReviewConsolePage() {
  const sourceModeLegendId = useId();
  const liveUrlFieldId = useId();
  const liveUrlHintId = useId();
  const liveUrlStatusId = useId();
  const [findingsVisible, setFindingsVisible] = useState(false);
  const [sourceInputMode, setSourceInputMode] = useState<SourceInputMode>("markup");
  const [liveUrl, setLiveUrl] = useState("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlStatus, setUrlStatus] = useState<{ tone: "idle" | "busy" | "ok" | "err"; text: string }>({
    tone: "idle",
    text: "",
  });

  const {
    source,
    setSource,
    wcagTarget,
    setWcagTarget,
    wcagVersion,
    setWcagVersion,
    result,
    isReviewing,
    runReview,
  } = useReviewSession();

  const dimensionScores = useMemo(() => computeDimensionScores(result.findings), [result.findings]);

  const reviewPasses = useMemo(() => {
    if (!source.trim()) return false;
    const s = result.summary;
    return s.critical === 0 && s.major === 0 && s.minor === 0;
  }, [result.summary, source]);

  const hasFindings = result.findings.length > 0;

  const urlBusy = isReviewing || isFetchingUrl;
  const canFetchUrl = Boolean(normalizeReviewUrl(liveUrl)) && !urlBusy;

  const scrollToFindingsPanel = useCallback(() => {
    const el = document.getElementById("panel-findings");
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chrome = document.querySelector<HTMLElement>(".review-chrome");
    const chromeH = chrome?.getBoundingClientRect().height ?? 0;
    const pad = 12 + chromeH;
    const top = el.getBoundingClientRect().top + window.scrollY - pad;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
  }, []);

  const runReviewAndShowFindings = useCallback(
    async (overrideSource?: string) => {
      setFindingsVisible(true);
      const reviewPromise = runReview(overrideSource);
      await Promise.resolve();
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      scrollToFindingsPanel();
      await reviewPromise;
      requestAnimationFrame(() => scrollToFindingsPanel());
    },
    [runReview, scrollToFindingsPanel]
  );

  useEffect(() => {
    document.body.dataset.appView = "scroll";
    return () => {
      delete document.body.dataset.appView;
    };
  }, []);

  const handleLiveUrlFetch = useCallback(
    async (andRun: boolean) => {
      if (!normalizeReviewUrl(liveUrl)) return;
      setIsFetchingUrl(true);
      setUrlStatus({ tone: "busy", text: "Fetching page HTML…" });
      try {
        const out = await fetchPageSource(liveUrl);
        if (!out.ok) {
          setUrlStatus({ tone: "err", text: out.error });
          return;
        }
        setSource(out.html);
        if (andRun) {
          setUrlStatus({ tone: "busy", text: "Running Review on fetched HTML…" });
          await runReviewAndShowFindings(out.html);
          setUrlStatus({
            tone: "ok",
            text: `Review finished using HTML from ${out.finalUrl}. Switch to “Markup” to inspect or edit the loaded source.`,
          });
        } else {
          setSourceInputMode("markup");
          setUrlStatus({
            tone: "ok",
            text: `Loaded HTML from ${out.finalUrl}. The markup editor is open—use Run Review when you are ready.`,
          });
        }
      } finally {
        setIsFetchingUrl(false);
      }
    },
    [liveUrl, runReviewAndShowFindings, setSource]
  );

  return (
    <main
      className={`main-grid ${findingsVisible ? "main-grid--review-stack" : "main-grid--review-source-only"}`}
    >
      <section id="panel-source" className="panel panel-input" aria-labelledby="input-heading">
        <h2 id="input-heading" className="panel-title">
          Source
        </h2>
        <fieldset className="wcag-fieldset" disabled={urlBusy}>
          <legend className="wcag-legend">Conformance target</legend>
          <p className="wcag-intro">
            Choose the WCAG <strong>release</strong> (2.1 vs 2.2) and the conformance <strong>level</strong> (A / AA /
            AAA). Inline <code className="inline-code">style</code> colors are checked for text (1.4.3 / 1.4.6) and
            simple border vs fill (1.4.11) when level is AA or AAA.
          </p>
          <div className="wcag-options" role="radiogroup" aria-label="WCAG conformance level">
            {WCAG_OPTIONS.map((opt) => (
              <label key={opt.value} className={`wcag-option ${wcagTarget === opt.value ? "selected" : ""}`}>
                <input
                  className="sr-only"
                  type="radio"
                  name="wcag-level"
                  value={opt.value}
                  checked={wcagTarget === opt.value}
                  onChange={() => setWcagTarget(opt.value)}
                />
                <span className="wcag-option-label">{opt.label}</span>
                <span className="wcag-option-hint">{opt.hint}</span>
              </label>
            ))}
          </div>
          <p className="wcag-sublegend">WCAG version</p>
          <div className="wcag-options wcag-options-version" role="radiogroup" aria-label="WCAG version">
            {VERSION_OPTIONS.map((opt) => (
              <label key={opt.value} className={`wcag-option ${wcagVersion === opt.value ? "selected" : ""}`}>
                <input
                  className="sr-only"
                  type="radio"
                  name="wcag-version"
                  value={opt.value}
                  checked={wcagVersion === opt.value}
                  onChange={() => setWcagVersion(opt.value)}
                />
                <span className="wcag-option-label">{opt.label}</span>
                <span className="wcag-option-hint">{opt.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="source-mode-fieldset" disabled={urlBusy}>
          <legend className="wcag-legend" id={sourceModeLegendId}>
            Source input
          </legend>
          <div className="source-mode-toggle-wrap">
            <p className="source-mode-intro">
              Toggle between the markup editor and loading HTML from a URL—only the active panel is shown.
            </p>
            <div className="source-mode-toggle" role="group" aria-labelledby={sourceModeLegendId}>
              <button
                type="button"
                className={`source-mode-toggle-btn${sourceInputMode === "markup" ? " source-mode-toggle-btn--active" : ""}`}
                aria-pressed={sourceInputMode === "markup"}
                aria-controls="panel-markup-source"
                onClick={() => {
                  setSourceInputMode("markup");
                  setUrlStatus({ tone: "idle", text: "" });
                }}
              >
                Markup
              </button>
              <button
                type="button"
                className={`source-mode-toggle-btn${sourceInputMode === "url" ? " source-mode-toggle-btn--active" : ""}`}
                aria-pressed={sourceInputMode === "url"}
                aria-controls="panel-live-url-source"
                onClick={() => {
                  setSourceInputMode("url");
                  setUrlStatus({ tone: "idle", text: "" });
                }}
              >
                Live URL
              </button>
            </div>
          </div>
        </fieldset>

        {sourceInputMode === "url" ? (
        <section
          id="panel-live-url-source"
          className="review-source-card review-source-card--web"
          aria-labelledby="live-url-heading"
        >
          <header className="review-source-card__head">
            <span className="review-source-card__badge review-source-card__badge--web">Web</span>
            <h3 id="live-url-heading" className="review-source-card__title">
              Load from URL
            </h3>
            <p id={liveUrlHintId} className="review-source-card__sub">
              Pull HTML over the network into the code panel. <code className="inline-code">npm run dev</code> uses a
              built-in proxy; static hosting may need <code className="inline-code">VITE_PAGE_FETCH_PROXY</code> or
              CORS-friendly pages.
            </p>
          </header>
          <fieldset className="live-url-fieldset" disabled={urlBusy}>
            <legend className="sr-only">Live URL fetch</legend>
            <div className="live-url-row">
              <label className="live-url-label" htmlFor={liveUrlFieldId}>
                Page address
              </label>
              <div className="live-url-controls">
                <input
                  id={liveUrlFieldId}
                  type="url"
                  className="live-url-input"
                  inputMode="url"
                  autoComplete="url"
                  spellCheck={false}
                  placeholder="https://example.com/your-page"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  aria-describedby={liveUrlHintId}
                />
                <button
                  type="button"
                  className="btn btn-secondary live-url-btn btn-with-icon"
                  disabled={!canFetchUrl}
                  onClick={() => void handleLiveUrlFetch(false)}
                >
                  <IconFetchIntoCode />
                  Fetch Into Code
                </button>
                <button
                  type="button"
                  className="btn btn-primary live-url-btn btn-with-icon"
                  disabled={!canFetchUrl}
                  onClick={() => void handleLiveUrlFetch(true)}
                >
                  <IconFetchAndRun />
                  Fetch &amp; Run Review
                </button>
              </div>
            </div>
            <p
              id={liveUrlStatusId}
              className={`live-url-status live-url-status--${urlStatus.tone}`}
              role="status"
              aria-live="polite"
            >
              {urlStatus.text}
            </p>
          </fieldset>
        </section>
        ) : (
        <section
          id="panel-markup-source"
          className="review-source-card review-source-card--markup"
          aria-labelledby="markup-source-heading"
        >
          <header className="review-source-card__head review-source-card__head--two-col">
            <div className="review-source-card__head-main">
              <span className="review-source-card__badge review-source-card__badge--markup">Code</span>
              <h3 id="markup-source-heading" className="review-source-card__title">
                Markup editor
              </h3>
              <p className="review-source-card__sub">
                Paste or edit LWC, Aura, or static HTML here—this is what <strong>Run Review</strong> analyzes.
              </p>
            </div>
            <div className="review-source-card__head-actions run-review-row">
              <button
                type="button"
                className="btn btn-primary btn-run-review btn-with-icon"
                onClick={() => void runReviewAndShowFindings()}
                disabled={urlBusy}
                aria-busy={isReviewing}
              >
                {isReviewing ? (
                  <>
                    <span className="spinner spinner--inline" aria-hidden />
                    Running Review…
                  </>
                ) : (
                  <>
                    <IconRunReview />
                    Run Review
                  </>
                )}
              </button>
            </div>
          </header>
          <label className="sr-only" htmlFor="code-input">
            Markup source editor
          </label>
          <div className="code-input-wrap">
            <textarea
              id="code-input"
              className="code-input"
              spellCheck={false}
              value={source}
              disabled={urlBusy}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Paste &lt;template&gt;…&lt;/template&gt; or mixed component markup"
            />
          </div>
        </section>
        )}
      </section>

      {findingsVisible ? (
        <section
          id="panel-findings"
          className="panel panel-results"
          aria-labelledby="panel-results-title"
          aria-busy={isReviewing}
        >
          <div className="panel-results-header">
            <h2 id="panel-results-title" className="panel-results-title">Review Results</h2>
            {!isReviewing && hasFindings && (
              <p className="panel-results-subtitle">
                {reviewPasses
                  ? `No issues found — ${result.findings.length} informational note${result.findings.length === 1 ? "" : "s"} for manual verification`
                  : `${result.findings.length} finding${result.findings.length === 1 ? "" : "s"} detected across your markup`}
              </p>
            )}
          </div>
          {isReviewing ? (
            <ResultsSpinner />
          ) : (
            <>
              {reviewPasses && <ReviewSuccessBanner findingsCount={result.findings.length} />}

              <ScoreOverview dimensions={dimensionScores} />

              <FindingsPanel result={result} />
            </>
          )}
        </section>
      ) : null}
    </main>
  );
}
