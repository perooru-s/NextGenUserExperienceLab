import type { Finding, FindingCategory, FindingSeverity } from "../types";

export function findingMatchesQuery(f: Finding, q: string): boolean {
  const needle = q.toLowerCase();
  const hay: string[] = [f.title, f.detail];
  if (f.remediation) hay.push(f.remediation);
  if (f.importance) hay.push(f.importance);
  if (f.snippet) hay.push(f.snippet);
  if (f.fixSteps) hay.push(...f.fixSteps);
  if (f.resources) hay.push(...f.resources.flatMap((r) => [r.label, r.href]));
  if (f.wcag) hay.push(f.wcag.criterion, f.wcag.scope);
  return hay.some((s) => s.toLowerCase().includes(needle));
}

export function computeFilteredFindings(
  findings: Finding[],
  filter: FindingCategory | "all",
  severityFilter: FindingSeverity | "all",
  findQuery: string
): {
  categoryFiltered: Finding[];
  filtered: Finding[];
  listNarrowed: boolean;
} {
  const categoryFiltered = filter === "all" ? findings : findings.filter((f) => f.category === filter);

  let filtered = categoryFiltered;
  if (severityFilter !== "all") {
    filtered = filtered.filter((f) => f.severity === severityFilter);
  }
  const q = findQuery.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter((f) => findingMatchesQuery(f, q));
  }

  const listNarrowed =
    categoryFiltered.length < findings.length || filtered.length < categoryFiltered.length;

  return { categoryFiltered, filtered, listNarrowed };
}
