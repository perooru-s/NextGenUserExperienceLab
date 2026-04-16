export type FindingCategory = "ux" | "a11y" | "mobile" | "slds";

export type FindingSeverity = "critical" | "major" | "minor" | "info";

/** User-selected conformance target; findings are filtered so AA includes A-relevant checks plus AA-only checks, etc. */
export type WcagLevel = "A" | "AA" | "AAA";

/** WCAG release — affects criterion labels (e.g. 2.5.8 exists in 2.2 AA only). */
export type WcagVersion = "2.1" | "2.2";

export interface WcagRef {
  /** Minimum level at which this finding applies (e.g. reflow checks apply from AA upward). */
  scope: WcagLevel;
  /** Short WCAG 2.x reference for traceability. */
  criterion: string;
}

/** Authoritative or learning links (W3C WAI, MDN, Salesforce, SLDS, etc.). */
export interface ExternalResource {
  label: string;
  href: string;
}

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  detail: string;
  remediation?: string;
  snippet?: string;
  lineHint?: number;
  wcag?: WcagRef;
  /** Why the issue matters for users, compliance, and delivery. */
  importance?: string;
  /** Concrete steps to understand and fix the issue. */
  fixSteps?: string[];
  /** Reference portals and deep links. */
  resources?: ExternalResource[];
}

export interface ReviewResult {
  findings: Finding[];
  summary: {
    critical: number;
    major: number;
    minor: number;
    info: number;
  };
  meta: {
    analyzedAt: string;
    lineCount: number;
    wcagTarget: WcagLevel;
    wcagVersion: WcagVersion;
  };
}
