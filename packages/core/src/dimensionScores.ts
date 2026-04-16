import type { Finding, FindingCategory, FindingSeverity } from "./types.js";

/** Mobile-oriented checks -> Performance lens */
const PERFORMANCE_CATEGORIES: FindingCategory[] = ["mobile"];

/** WCAG & a11y findings */
const ACCESSIBILITY_CATEGORIES: FindingCategory[] = ["a11y"];

/** UX consistency + SLDS -> Best practices */
const BEST_PRACTICES_CATEGORIES: FindingCategory[] = ["ux", "slds"];

const PENALTY: Record<FindingSeverity, number> = {
  critical: 14,
  major: 7,
  minor: 3,
  info: 1,
};

export type DimensionKey =
  | "performance"
  | "accessibility"
  | "bestPractices"
  | "seo";

export interface DimensionScore {
  key: DimensionKey;
  label: string;
  score: number;
  counts: Record<FindingSeverity, number>;
  total: number;
}

function tally(findings: Finding[]): Record<FindingSeverity, number> {
  const counts: Record<FindingSeverity, number> = {
    critical: 0,
    major: 0,
    minor: 0,
    info: 0,
  };
  for (const f of findings) {
    counts[f.severity]++;
  }
  return counts;
}

function scoreFromCounts(counts: Record<FindingSeverity, number>): number {
  let penalty = 0;
  (Object.keys(counts) as FindingSeverity[]).forEach((sev) => {
    penalty += counts[sev] * PENALTY[sev];
  });
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

/** Discoverability / semantics that overlap with technical SEO concerns (static markup heuristics). */
function matchesSeoLens(f: Finding): boolean {
  const crit = f.wcag?.criterion ?? "";
  if (/\b2\.4\.|1\.1\.1|1\.3\.1|2\.4\.4|2\.4\.2|link purpose|non-text content/i.test(crit)) return true;
  const blob = `${f.title} ${f.detail}`;
  return /\b(alt text|missing alt|empty alt|image missing|link purpose|heading|landmark|breadcrumb|navigation|page title|document title|meta description|name, role|info and relationships)/i.test(
    blob
  );
}

export function computeDimensionScores(findings: Finding[]): DimensionScore[] {
  const perf = findings.filter((f) => PERFORMANCE_CATEGORIES.includes(f.category));
  const a11y = findings.filter((f) => ACCESSIBILITY_CATEGORIES.includes(f.category));
  const bp = findings.filter((f) => BEST_PRACTICES_CATEGORIES.includes(f.category));
  const seo = findings.filter(matchesSeoLens);

  const build = (key: DimensionKey, label: string, list: Finding[]): DimensionScore => {
    const counts = tally(list);
    const total = list.length;
    return {
      key,
      label,
      score: total === 0 ? 100 : scoreFromCounts(counts),
      counts,
      total,
    };
  };

  return [
    build("performance", "Performance", perf),
    build("accessibility", "Accessibility", a11y),
    build("bestPractices", "Best practices", bp),
    build("seo", "SEO & discoverability", seo),
  ];
}
