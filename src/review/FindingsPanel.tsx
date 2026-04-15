import { useId, useMemo, useState } from "react";
import type { Finding, FindingCategory, FindingSeverity, ReviewResult } from "../types";
import { computeFilteredFindings } from "./findingsFilterUtils";
import { categoryLabels } from "./reviewConstants";

function severityClass(s: FindingSeverity): string {
  return `sev sev-${s}`;
}

function FindingsEmptyIllustration() {
  const gradId = `findings-empty-grad-${useId().replace(/:/g, "")}`;
  return (
    <svg className="findings-empty-svg" viewBox="0 0 160 140" width={160} height={140} aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <rect x="18" y="22" width="92" height="96" rx="14" fill={`url(#${gradId})`} stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      <path d="M38 48h52M38 64h40M38 80h48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.35" />
      <circle cx="108" cy="88" r="28" fill="var(--bg-elevated)" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.45" />
      <path d="M98 88h20M108 78v20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.5" />
      <path d="M128 108l18 18" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.45" />
    </svg>
  );
}

export function FindingListItem({ f }: { f: Finding }) {
  return (
    <li className="finding-card">
      <div className="finding-top">
        <span className={severityClass(f.severity)}>{f.severity}</span>
        <span className="cat-badge">{categoryLabels[f.category]}</span>
        {f.lineHint != null && <span className="line-badge">~line {f.lineHint}</span>}
        {f.wcag && (
          <span className="wcag-badge" title={`Applies from WCAG ${f.wcag.scope} upward`}>
            {f.wcag.criterion} · {f.wcag.scope}+
          </span>
        )}
      </div>
      <h3 className="finding-title">{f.title}</h3>
      <p className="finding-detail">{f.detail}</p>
      {f.importance && (
        <div className="finding-section">
          <h4 className="finding-section-title">Why this matters</h4>
          <p className="finding-section-body">{f.importance}</p>
        </div>
      )}
      {f.fixSteps && f.fixSteps.length > 0 && (
        <div className="finding-section">
          <h4 className="finding-section-title">How to understand and fix</h4>
          <ol className="finding-steps">
            {f.fixSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
      {f.remediation && (
        <p className="finding-remediation">
          <strong>Quick fix:</strong> {f.remediation}
        </p>
      )}
      {f.snippet && (
        <pre className="snippet">
          <code>{f.snippet}</code>
        </pre>
      )}
      {f.resources && f.resources.length > 0 && (
        <div className="finding-section">
          <h4 className="finding-section-title">Reference portals</h4>
          <ul className="finding-links">
            {f.resources.map((r, i) => (
              <li key={`${r.href}-${i}`}>
                <a href={r.href} target="_blank" rel="noopener noreferrer">
                  {r.label}
                  <span className="finding-link-suffix" aria-hidden="true">
                    {" "}
                    ↗
                  </span>
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function FindingsControlsBar({
  result,
  filter,
  setFilter,
  severityFilter,
  setSeverityFilter,
  findQuery,
  setFindQuery,
  categoryFiltered,
  filtered,
  listNarrowed,
}: {
  result: ReviewResult;
  filter: FindingCategory | "all";
  setFilter: (f: FindingCategory | "all") => void;
  severityFilter: FindingSeverity | "all";
  setSeverityFilter: (s: FindingSeverity | "all") => void;
  findQuery: string;
  setFindQuery: (q: string) => void;
  categoryFiltered: Finding[];
  filtered: Finding[];
  listNarrowed: boolean;
}) {
  const inputId = "findings-find-input";

  return (
    <>
      <div className="results-toolbar">
        <div className="results-toolbar-main">
          <h3 id="results-heading" className="panel-title">
            Findings
          </h3>
          <div className="summary-chips" role="status">
            <span className="chip chip-critical">{result.summary.critical} critical</span>
            <span className="chip chip-major">{result.summary.major} major</span>
            <span className="chip chip-minor">{result.summary.minor} minor</span>
            <span className="chip chip-info">{result.summary.info} info</span>
          </div>
        </div>
      </div>

      <div className="filter-row">
        {(["all", "ux", "a11y", "mobile", "slds"] as const).map((key) => (
          <button
            key={key}
            type="button"
            className={`filter-btn ${filter === key ? "active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {key === "all" ? "All" : categoryLabels[key]}
          </button>
        ))}
      </div>

      <div className="findings-find-row">
        <label className="findings-search-field" htmlFor={inputId}>
          <span className="field-label">Find in findings</span>
          <input
            id={inputId}
            type="search"
            className="findings-search-input"
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            placeholder="Title, detail, WCAG ref, links…"
            autoComplete="off"
            aria-controls="findings-list"
          />
        </label>
        <div className="findings-severity-filters" role="group" aria-label="Filter by severity">
          <span className="field-label findings-severity-label">Severity</span>
          <div className="filter-row findings-severity-buttons">
            {(["all", "critical", "major", "minor", "info"] as const).map((key) => (
              <button
                key={key}
                type="button"
                className={`filter-btn ${severityFilter === key ? "active" : ""}`}
                onClick={() => setSeverityFilter(key)}
              >
                {key === "all" ? "All" : key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {listNarrowed && (
        <p className="findings-filter-count" aria-live="polite">
          Showing {filtered.length} of {categoryFiltered.length} in this view
          {categoryFiltered.length < result.findings.length ? ` (${result.findings.length} total)` : ""}
        </p>
      )}

      <p className="meta-line">
        Target WCAG {result.meta.wcagVersion} {result.meta.wcagTarget} · {result.meta.lineCount} lines ·{" "}
        {new Date(result.meta.analyzedAt).toLocaleString()}
      </p>
    </>
  );
}

export function FindingsPanel({ result }: { result: ReviewResult }) {
  const [filter, setFilter] = useState<FindingCategory | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<FindingSeverity | "all">("all");
  const [findQuery, setFindQuery] = useState("");

  const { categoryFiltered, filtered, listNarrowed } = useMemo(
    () => computeFilteredFindings(result.findings, filter, severityFilter, findQuery),
    [result.findings, filter, severityFilter, findQuery]
  );

  if (result.findings.length === 0) {
    return null;
  }

  return (
    <>
      <FindingsControlsBar
        result={result}
        filter={filter}
        setFilter={setFilter}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        findQuery={findQuery}
        setFindQuery={setFindQuery}
        categoryFiltered={categoryFiltered}
        filtered={filtered}
        listNarrowed={listNarrowed}
      />

      <ul id="findings-list" className="findings-list">
        {filtered.length === 0 ? (
          <li className="empty-state empty-state--findings" role="status">
            <div className="findings-empty-visual" aria-hidden>
              <FindingsEmptyIllustration />
            </div>
            <p className="findings-empty-headline">
              {categoryFiltered.length === 0 ? "No findings in this filter" : "No findings match this view"}
            </p>
            <p className="findings-empty-hint">
              {categoryFiltered.length === 0
                ? "Choose a different category tab, or reset severity and search to see all issues again."
                : "Try clearing the search box, widening severity, or switching category."}
            </p>
          </li>
        ) : (
          filtered.map((f) => <FindingListItem key={f.id} f={f} />)
        )}
      </ul>
    </>
  );
}
