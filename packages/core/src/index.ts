export { analyzeSalesforceUI } from "./analyzer.js";
export { computeDimensionScores } from "./dimensionScores.js";
export { analyzeInlineStylesContrast, parseColor, contrastRatio } from "./colors.js";
export { guides, LINKS } from "./findingGuides.js";

export type { ContrastFindingInput } from "./colors.js";
export type { FindingGuide } from "./findingGuides.js";
export type { DimensionKey, DimensionScore } from "./dimensionScores.js";
export type {
  Finding,
  FindingCategory,
  FindingSeverity,
  ReviewResult,
  WcagLevel,
  WcagVersion,
  WcagRef,
  ExternalResource,
} from "./types.js";
