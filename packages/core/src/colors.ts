import type { ExternalResource, FindingSeverity, WcagLevel, WcagRef } from "./types.js";
import { guides } from "./findingGuides.js";

export interface ContrastFindingInput {
  lineHint: number;
  severity: FindingSeverity;
  title: string;
  detail: string;
  remediation?: string;
  wcag: WcagRef;
  importance?: string;
  fixSteps?: string[];
  resources?: ExternalResource[];
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

/** Alpha-composite `fg` over `bg` (both sRGB 0-255). */
function composite(fg: RGB, fgAlpha: number, bg: RGB): RGB {
  const a = Math.max(0, Math.min(1, fgAlpha));
  return {
    r: clampByte(fg.r * a + bg.r * (1 - a)),
    g: clampByte(fg.g * a + bg.g * (1 - a)),
    b: clampByte(fg.b * a + bg.b * (1 - a)),
  };
}

function expandHex3(h: string): RGB | null {
  if (h.length !== 3) return null;
  const r = parseInt(h[0] + h[0], 16);
  const g = parseInt(h[1] + h[1], 16);
  const b = parseInt(h[2] + h[2], 16);
  if ([r, g, b].some((x) => Number.isNaN(x))) return null;
  return { r, g, b };
}

function parseHex6(h: string): RGB | null {
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((x) => Number.isNaN(x))) return null;
  return { r, g, b };
}

/** Parse #rgb, #rrggbb, #rrggbbaa (alpha ignored unless caller uses rgba path). */
export function parseColor(value: string): { rgb: RGB; alpha: number } | null {
  const v = value.trim().toLowerCase();
  if (!v) return null;

  if (v.startsWith("#")) {
    const hex = v.slice(1);
    if (hex.length === 3) {
      const rgb = expandHex3(hex);
      return rgb ? { rgb, alpha: 1 } : null;
    }
    if (hex.length === 6) {
      const rgb = parseHex6(hex);
      return rgb ? { rgb, alpha: 1 } : null;
    }
    if (hex.length === 8) {
      const rgb = parseHex6(hex.slice(0, 6));
      if (!rgb) return null;
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      return { rgb, alpha: Number.isFinite(a) ? a : 1 };
    }
    return null;
  }

  const rgbFn = v.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+)\s*)?\)$/
  );
  if (rgbFn) {
    const r = Number(rgbFn[1]);
    const g = Number(rgbFn[2]);
    const b = Number(rgbFn[3]);
    const a = rgbFn[4] !== undefined ? Number(rgbFn[4]) : 1;
    if ([r, g, b, a].some((x) => Number.isNaN(x))) return null;
    return { rgb: { r, g, b }, alpha: Math.max(0, Math.min(1, a)) };
  }

  return null;
}

function luminance({ r, g, b }: RGB): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(fg: RGB, bg: RGB): number {
  const L1 = luminance(fg) + 0.05;
  const L2 = luminance(bg) + 0.05;
  return L1 > L2 ? L1 / L2 : L2 / L1;
}

function parseStyleDeclarations(styleAttr: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of styleAttr.split(";")) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim().toLowerCase();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = val;
  }
  return out;
}

/** First solid color in a simple background value (hex/rgb). */
function backgroundToRgb(value: string): { rgb: RGB; alpha: number } | null {
  const v = value.trim().toLowerCase();
  const hex = v.match(/#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b/);
  if (hex) {
    const p = parseColor(hex[0]);
    if (p) return p;
  }
  const rgbMatch = v.match(/rgba?\([^)]+\)/);
  if (rgbMatch) {
    const p = parseColor(rgbMatch[0]);
    if (p) return p;
  }
  return null;
}

function parseFontSizeToPx(value: string | undefined): number | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  const px = v.match(/^(\d+(?:\.\d+)?)px$/);
  if (px) return Number(px[1]);
  const pt = v.match(/^(\d+(?:\.\d+)?)pt$/);
  if (pt) return Number(pt[1]) * (96 / 72);
  const rem = v.match(/^(\d+(?:\.\d+)?)rem$/);
  if (rem) return Number(rem[1]) * 16;
  const em = v.match(/^(\d+(?:\.\d+)?)em$/);
  if (em) return Number(em[1]) * 16;
  return null;
}

function isBold(decls: Record<string, string>): boolean {
  const w = decls["font-weight"]?.trim().toLowerCase() ?? "";
  if (!w) return false;
  if (/^(bold|bolder)$/.test(w)) return true;
  const n = parseInt(w, 10);
  return !Number.isNaN(n) && n >= 700;
}

/** WCAG "large text": >=24px regular or >=18.67px (14pt) bold. */
function isLargeText(decls: Record<string, string>): boolean {
  const fs = parseFontSizeToPx(decls["font-size"]);
  if (fs != null) {
    if (fs >= 24) return true;
    if (isBold(decls) && fs >= 14 * (96 / 72)) return true;
  }
  return false;
}

function requiredTextRatio(target: WcagLevel, large: boolean): { min: number; label: string } {
  if (target === "AAA") {
    return large ? { min: 4.5, label: "AAA large (1.4.6)" } : { min: 7, label: "AAA normal (1.4.6)" };
  }
  return large ? { min: 3, label: "AA large (1.4.3)" } : { min: 4.5, label: "AA normal (1.4.3)" };
}

const WHITE: RGB = { r: 255, g: 255, b: 255 };

/**
 * Scan markup for inline `style` attributes and emit contrast-related findings.
 * Only runs meaningful checks when `wcagTarget` is AA or AAA.
 */
export function analyzeInlineStylesContrast(
  template: string,
  globalOffset: number,
  lineOf: (globalIndex: number) => number,
  wcagTarget: WcagLevel
): ContrastFindingInput[] {
  const out: ContrastFindingInput[] = [];
  if (wcagTarget === "A") return out;

  const styleRe = /\bstyle\s*=\s*(["'])((?:\\\1|(?!\1).)*)\1/gi;
  let m: RegExpExecArray | null;
  while ((m = styleRe.exec(template)) !== null) {
    const styleVal = m[2].replace(/\\(.)/g, "$1");
    const decls = parseStyleDeclarations(styleVal);
    const colorRaw = decls["color"];
    const bgColorRaw = decls["background-color"];
    const bgShorthand = decls["background"];

    const fgParsed = colorRaw ? parseColor(colorRaw) : null;
    const bgParsed =
      bgColorRaw ? parseColor(bgColorRaw) : bgShorthand ? backgroundToRgb(bgShorthand) : null;

    let assumedBg = false;

    if (colorRaw && fgParsed) {
      let bgRgb: RGB;
      if (bgParsed) {
        bgRgb = composite(bgParsed.rgb, bgParsed.alpha, WHITE);
      } else {
        bgRgb = WHITE;
        assumedBg = true;
      }

      const fgRgb = composite(fgParsed.rgb, fgParsed.alpha, bgRgb);

      const large = isLargeText(decls);
      const { min, label } = requiredTextRatio(wcagTarget, large);
      const ratio = contrastRatio(fgRgb, bgRgb);
      const lineHint = lineOf(globalOffset + m.index);

      if (ratio < min) {
        out.push({
          lineHint,
          severity: "major",
          title: "Insufficient text contrast (inline style)",
          detail: `Measured about ${ratio.toFixed(2)}:1 between foreground and background${assumedBg ? " (background not set; assumed #ffffff)" : ""}. Required for ${label}: at least ${min}:1.`,
          remediation:
            "Darken text, lighten background, or use SLDS tokens with documented contrast. Re-check in the real theme (e.g. Lightning brand).",
          wcag: {
            scope: wcagTarget === "AAA" ? "AAA" : "AA",
            criterion: wcagTarget === "AAA" ? "1.4.6 Contrast (Enhanced)" : "1.4.3 Contrast (Minimum)",
          },
          ...guides.contrastText,
        });
      }
    }

    /* 1.4.11 simplified: border vs background on same element */
    const borderRaw = decls["border"] || decls["border-color"];
    if (borderRaw && bgColorRaw) {
      const borderColorMatch = borderRaw.match(/#(?:[0-9a-f]{3}|[0-9a-f]{6})\b|rgba?\([^)]+\)/i);
      const borderColorStr = borderColorMatch
        ? borderColorMatch[0]
        : borderRaw.includes("#") || borderRaw.includes("rgb")
          ? borderRaw
          : null;
      const bParsed = borderColorStr ? parseColor(borderColorStr) : parseColor(borderRaw);
      const bgP = parseColor(bgColorRaw);
      if (bParsed && bgP) {
        const bRgb = composite(bParsed.rgb, bParsed.alpha, WHITE);
        const bgRgb = composite(bgP.rgb, bgP.alpha, WHITE);
        const uiRatio = contrastRatio(bRgb, bgRgb);
        if (uiRatio < 3) {
          out.push({
            lineHint: lineOf(globalOffset + m.index),
            severity: "minor",
            title: "Low non-text contrast (border vs fill)",
            detail: `About ${uiRatio.toFixed(2)}:1 between border and background \u2014 UI components often need at least 3:1 (WCAG 1.4.11).`,
            wcag: { scope: "AA", criterion: "1.4.11 Non-text Contrast" },
            ...guides.contrastNonText,
          });
        }
      }
    }
  }

  return out;
}
