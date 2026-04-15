import type { DimensionScore } from "../lib/dimensionScores";
import type { FindingSeverity } from "../types";

export function IconExportJson() {
  return (
    <svg className="btn-export-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 4H6a2 2 0 0 0-2 2v3a2 2 0 1 1 0 4v3a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v3a2 2 0 1 0 0 4v3a2 2 0 0 1-2 2h-2" strokeLinecap="round" />
    </svg>
  );
}

export function IconExportWord() {
  return (
    <svg className="btn-export-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6M9 9h1" />
    </svg>
  );
}

export function IconExportPdf() {
  return (
    <svg className="btn-export-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M10 12h4M10 16h4" />
    </svg>
  );
}

export function IconOverviewNav() {
  return (
    <svg
      className="top-bar-home-icon-svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

/** Curated tools & references — top bar link to `/resources`. */
export function IconA11yResources() {
  return (
    <svg
      className="top-bar-resources-icon-svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

/** Lightning scan — paired with “Run Review”. */
export function IconRunReview() {
  return (
    <svg
      className="btn-inline-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 14 10 13 2" />
    </svg>
  );
}

/** Fetch HTML into the markup editor (arrow into tray). */
export function IconFetchIntoCode() {
  return (
    <svg
      className="btn-inline-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M4 20h16" />
    </svg>
  );
}

/** Fetch from URL and run analysis (into tray + bolt). */
export function IconFetchAndRun() {
  return (
    <svg className="btn-inline-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 4v8" />
        <path d="m7 8 3 3 3-3" />
        <path d="M3 19h11" />
      </g>
      <g transform="translate(8.5, -0.5) scale(0.42)">
        <polygon fill="currentColor" points="13 2 3 14 12 14 11 22 21 10 14 10 13 2" />
      </g>
    </svg>
  );
}

function scoreRingStrokeVar(score: number): string {
  if (score >= 80) return "var(--score-ring-high)";
  if (score >= 55) return "var(--score-ring-mid)";
  return "var(--score-ring-low)";
}

type ScoreRingSize = "compact" | "comfortable" | "full";

const SCORE_RING_DIMS: Record<
  ScoreRingSize,
  { vb: number; center: number; r: number; strokeWidth: number; wrapClass: string; svgClass: string; valueClass: string; maxClass: string }
> = {
  compact: {
    vb: 60,
    center: 30,
    r: 24,
    strokeWidth: 5,
    wrapClass: "score-ring-wrap--compact",
    svgClass: "score-ring-svg--compact",
    valueClass: "score-ring-value--compact",
    maxClass: "score-ring-max--compact",
  },
  comfortable: {
    vb: 76,
    center: 38,
    r: 30,
    strokeWidth: 6,
    wrapClass: "score-ring-wrap--comfortable",
    svgClass: "score-ring-svg--comfortable",
    valueClass: "score-ring-value--comfortable",
    maxClass: "score-ring-max--comfortable",
  },
  full: {
    vb: 88,
    center: 44,
    r: 34,
    strokeWidth: 8,
    wrapClass: "",
    svgClass: "",
    valueClass: "score-ring-value",
    maxClass: "score-ring-max",
  },
};

function ScoreRing({ score, size = "full" }: { score: number; size?: ScoreRingSize }) {
  const d = SCORE_RING_DIMS[size];
  const circumference = 2 * Math.PI * d.r;
  const dash = (score / 100) * circumference;
  return (
    <div className={["score-ring-wrap", d.wrapClass].filter(Boolean).join(" ")}>
      <svg className={["score-ring-svg", d.svgClass].filter(Boolean).join(" ")} viewBox={`0 0 ${d.vb} ${d.vb}`} aria-hidden>
        <circle className="score-ring-track" cx={d.center} cy={d.center} r={d.r} fill="none" strokeWidth={d.strokeWidth} />
        <circle
          className="score-ring-fill"
          cx={d.center}
          cy={d.center}
          r={d.r}
          fill="none"
          strokeWidth={d.strokeWidth}
          style={{ stroke: scoreRingStrokeVar(score) }}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${d.center} ${d.center})`}
        />
      </svg>
      <div className="score-ring-center">
        <span className={d.valueClass}>{score}</span>
        <span className={d.maxClass}>/100</span>
      </div>
    </div>
  );
}

function SeverityMiniBar({ counts, total }: { counts: Record<FindingSeverity, number>; total: number }) {
  if (total === 0) {
    return <div className="severity-mini-bar severity-mini-bar-empty" title="No findings in this category" />;
  }
  const sevs: FindingSeverity[] = ["critical", "major", "minor", "info"];
  return (
    <div className="severity-mini-bar" role="img" aria-label="Finding mix by severity">
      {sevs.map((sev) => {
        const n = counts[sev];
        if (n === 0) return null;
        return (
          <span
            key={sev}
            className={`severity-mini-seg severity-mini-seg-${sev}`}
            style={{ flexGrow: n }}
            title={`${sev}: ${n}`}
          />
        );
      })}
    </div>
  );
}

export function ResultsSpinner() {
  return (
    <div className="results-spinner-block" role="status" aria-live="polite">
      <div className="results-spinner-visual" aria-hidden>
        <div className="results-spinner-pulse" />
        <div className="spinner results-spinner-ring" />
        <div className="results-spinner-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
      <p className="results-spinner-text">Analyzing markup…</p>
    </div>
  );
}

export function ReviewSuccessBanner({ findingsCount }: { findingsCount: number }) {
  const detail =
    findingsCount === 0
      ? "Static analysis reported no issues for this source and WCAG target."
      : "No critical, major, or minor findings. Informational notes below are reminders—verify behavior in a running org.";

  return (
    <div className="review-success-banner" role="status" aria-live="polite">
      <span className="review-success-icon" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
          <path
            className="review-success-check-path"
            pathLength={1}
            d="M20 6L9 17l-5-5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="review-success-text">
        <strong className="review-success-title">All clear</strong>
        <p className="review-success-detail">{detail}</p>
      </div>
    </div>
  );
}

function ScoreDimensionCard({
  d,
  showHeading = true,
  listRole,
}: {
  d: DimensionScore;
  showHeading?: boolean;
  listRole?: "listitem";
}) {
  return (
    <article
      className={["score-card score-card--overview-tile", `score-card--dim-${d.key}`].filter(Boolean).join(" ")}
      role={listRole}
    >
      <ScoreRing score={d.score} size="comfortable" />
      <div className="score-card-body">
        {showHeading ? <h4 className="score-card-title">{d.label}</h4> : null}
        <SeverityMiniBar counts={d.counts} total={d.total} />
        <p className="score-card-meta">
          {d.total === 0 ? "No findings" : `${d.total} finding${d.total === 1 ? "" : "s"}`}
        </p>
      </div>
    </article>
  );
}

export function ScoreOverview({ dimensions, className }: { dimensions: DimensionScore[]; className?: string }) {
  const howScoresDetails = (
    <details className="score-overview-how">
      <summary className="score-overview-how-summary">How scores are calculated</summary>
      <p className="score-overview-how-body">
        Each lens tallies a subset of the same static findings (severity-weighted to 0–100). Performance maps to
        mobile-oriented rules; Accessibility to WCAG-style a11y checks; Best practices to UX consistency and SLDS
        hints. <strong>SEO &amp; discoverability</strong> can overlap other lenses (e.g. links, headings, alt text)—the
        same issue can affect more than one lens.
      </p>
    </details>
  );

  const lensLine = dimensions.map((d) => d.label).join(" · ");

  return (
    <section className={["score-overview", className].filter(Boolean).join(" ")} aria-label="Scores by category">
      <h3 className="score-overview-heading">Quality overview</h3>
      <p className="score-overview-sub">{lensLine}</p>
      {howScoresDetails}
      <div className="score-overview-strip" role="list">
        {dimensions.map((d) => (
          <ScoreDimensionCard key={d.key} d={d} listRole="listitem" />
        ))}
      </div>
    </section>
  );
}
