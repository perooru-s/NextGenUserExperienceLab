/**
 * Generates a clean, minimal business PDF: Accessibility primer + Lightning A11y Lab.
 * Two-color palette: PwC orange + light cream. Professional layout.
 *
 * Run:    node scripts/generate-a11y-overview-pdf.mjs
 * Output: ACCESSIBILITY-AND-TOOL-OVERVIEW.pdf
 */
import { jsPDF } from "jspdf";

const ML = 24;
const MR = 24;
const PW = 210;
const CW = PW - ML - MR;
const PH = 297;
const MT = 28;
const MB = 26;
const LH = 5.6;

// Two-color palette
const ORANGE = [227, 82, 5];     // #E35205 — PwC orange
const CREAM = [255, 245, 238];   // #FFF5EE — light cream
const BLACK = [33, 33, 33];      // body text
const GRAY = [110, 110, 110];    // muted text
const LGRAY = [200, 200, 200];   // borders
const WHITE = [255, 255, 255];

let doc, y;

function ck(n = LH * 2) {
  if (y + n > PH - MB) { doc.addPage(); y = MT; return true; }
  return false;
}

function sf(style = "normal", size = 10) {
  doc.setFontSize(size);
  doc.setFont("helvetica", style);
}

function txt(t, opts = {}) {
  const {
    x = ML, maxWidth = CW, size = 10.2,
    style = "normal", color = BLACK, lineHeight = LH,
  } = opts;
  sf(style, size);
  doc.setTextColor(...color);
  for (const line of doc.splitTextToSize(t, maxWidth)) {
    ck(lineHeight);
    doc.text(line, x, y);
    y += lineHeight;
  }
}

// ── Headings ──

function h1(t) {
  y += 12;
  ck(18);
  sf("bold", 16);
  doc.setTextColor(...BLACK);
  doc.text(t, ML, y);
  y += 3;
  // Thin orange underline
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.8);
  doc.line(ML, y, ML + 40, y);
  y += 7;
}

function h2(t) {
  y += 9;
  ck(14);
  sf("bold", 12.5);
  doc.setTextColor(...ORANGE);
  doc.text(t, ML, y);
  y += 6;
}

function h3(t) {
  y += 6;
  ck(11);
  sf("bold", 10.5);
  doc.setTextColor(...BLACK);
  doc.text(t, ML, y);
  y += 5;
}

// ── Bullet with icon ──
// Using unicode symbols as simple "icons"
const ICON_ARROW = "\u25B8";   // small right triangle
const ICON_CHECK = "\u2714";   // check mark
const ICON_DOT = "\u25CF";     // filled circle (fallback)

function bullet(t, opts = {}) {
  const { indent = 0, bold = false, icon = ICON_ARROW } = opts;
  const ix = ML + 4 + indent;
  const tx = ix + 5;
  const tw = CW - 9 - indent;
  ck(LH * 2);

  sf("normal", 8);
  doc.setTextColor(...ORANGE);
  doc.text(icon, ix, y);

  if (bold && t.includes(" \u2014 ")) {
    const di = t.indexOf(" \u2014 ");
    const bp = t.substring(0, di);
    const rp = t.substring(di);
    sf("bold", 10.2); doc.setTextColor(...BLACK);
    const bw = doc.getTextWidth(bp);
    const lines = doc.splitTextToSize(bp + rp, tw);
    for (let i = 0; i < lines.length; i++) {
      ck();
      if (i === 0) {
        doc.setFont("helvetica", "bold"); doc.text(bp, tx, y);
        doc.setFont("helvetica", "normal");
        const rest = lines[0].substring(bp.length);
        if (rest) doc.text(rest, tx + bw, y);
      } else {
        doc.setFont("helvetica", "normal"); doc.text(lines[i], tx, y);
      }
      y += LH;
    }
  } else {
    txt(t, { x: tx, maxWidth: tw, style: bold ? "bold" : "normal" });
  }
  y += 1;
}

function numbered(n, t) {
  const nx = ML + 4;
  const tx = nx + 7;
  const tw = CW - 11;
  ck(LH * 2);
  sf("bold", 10.5); doc.setTextColor(...ORANGE); doc.text(`${n}`, nx, y);

  if (t.includes(" \u2014 ")) {
    const di = t.indexOf(" \u2014 ");
    const bp = t.substring(0, di);
    const rp = t.substring(di);
    const lines = doc.splitTextToSize(bp + rp, tw);
    for (let i = 0; i < lines.length; i++) {
      ck();
      if (i === 0) {
        sf("bold", 10.2); doc.setTextColor(...BLACK);
        const bw = doc.getTextWidth(bp); doc.text(bp, tx, y);
        sf("normal", 10.2);
        const rest = lines[0].substring(bp.length);
        if (rest) doc.text(rest, tx + bw, y);
      } else {
        sf("normal", 10.2); doc.setTextColor(...BLACK); doc.text(lines[i], tx, y);
      }
      y += LH;
    }
  } else {
    txt(t, { x: tx, maxWidth: tw });
  }
  y += 1.5;
}

// ── Tables — clean, proper cell padding, text vertically centered ──

function table(headers, rows, opts = {}) {
  const { colWidths } = opts;
  const nc = headers.length;
  const w = colWidths || headers.map(() => CW / nc);
  const padX = 3.5;
  const padY = 3;
  const fs = 8.8;

  function measureRowHeight(row, isHeader) {
    let maxLines = 1;
    for (let c = 0; c < row.length; c++) {
      sf(isHeader ? "bold" : "normal", fs);
      const lines = doc.splitTextToSize(String(row[c] || ""), w[c] - padX * 2);
      if (lines.length > maxLines) maxLines = lines.length;
    }
    return maxLines * (LH - 0.4) + padY * 2;
  }

  y += 4;

  // Header row
  const hh = measureRowHeight(headers, true);
  ck(hh + 30);

  doc.setFillColor(...CREAM);
  doc.rect(ML, y, CW, hh, "F");
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.5);
  doc.line(ML, y + hh, ML + CW, y + hh);

  let cx = ML;
  for (let c = 0; c < nc; c++) {
    sf("bold", fs); doc.setTextColor(...ORANGE);
    const lines = doc.splitTextToSize(headers[c], w[c] - padX * 2);
    let ty = y + padY + 3;
    for (const l of lines) { doc.text(l, cx + padX, ty); ty += LH - 0.4; }
    cx += w[c];
  }
  y += hh;

  // Data rows
  for (let r = 0; r < rows.length; r++) {
    const rh = measureRowHeight(rows[r], false);
    ck(rh + 2);

    // Alternating cream background
    if (r % 2 === 0) {
      doc.setFillColor(252, 249, 246);
      doc.rect(ML, y, CW, rh, "F");
    }

    // Bottom border
    doc.setDrawColor(...LGRAY);
    doc.setLineWidth(0.15);
    doc.line(ML, y + rh, ML + CW, y + rh);

    cx = ML;
    for (let c = 0; c < nc; c++) {
      const isBoldCol = c === 0 && nc >= 3;
      sf(isBoldCol ? "bold" : "normal", fs);
      doc.setTextColor(...BLACK);
      const cellText = String(rows[r][c] || "");
      const lines = doc.splitTextToSize(cellText, w[c] - padX * 2);
      let ty = y + padY + 3;
      for (const l of lines) { doc.text(l, cx + padX, ty); ty += LH - 0.4; }
      cx += w[c];
    }
    y += rh;
  }
  y += 5;
}

// ── Code block ──

function codeBlock(t) {
  ck(20); y += 2;
  const lines = t.split("\n");
  const bh = lines.length * 4.5 + 10;
  ck(bh);

  doc.setFillColor(...CREAM);
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.2);
  doc.roundedRect(ML, y - 4, CW, bh, 2, 2, "FD");

  doc.setFont("courier", "normal"); doc.setFontSize(8.5); doc.setTextColor(80, 80, 80);
  let ty = y + 2;
  for (const l of lines) { doc.text(l, ML + 6, ty); ty += 4.5; }
  y += bh + 2;
}

// ── Callout box — cream bg, thin orange left border ──

function callout(t) {
  ck(18);
  sf("bolditalic", 10);
  const lines = doc.splitTextToSize(t, CW - 16);
  const bh = lines.length * LH + 8;
  ck(bh);

  doc.setFillColor(...CREAM);
  doc.roundedRect(ML, y - 3, CW, bh, 2, 2, "F");
  doc.setFillColor(...ORANGE);
  doc.rect(ML, y - 3, 2.5, bh, "F");

  sf("italic", 10); doc.setTextColor(...BLACK);
  let ty = y + 1;
  for (const l of lines) { doc.text(l, ML + 8, ty); ty += LH; }
  y += bh + 3;
}

// ── Stat strip — minimal, clean ──

function stats(items) {
  ck(22);
  const boxW = CW / items.length;

  for (let i = 0; i < items.length; i++) {
    const bx = ML + i * boxW;

    // Orange number
    sf("bold", 22); doc.setTextColor(...ORANGE);
    const numW = doc.getTextWidth(items[i].num);
    doc.text(items[i].num, bx + (boxW - numW) / 2, y + 6);

    // Gray label below
    sf("normal", 7.5); doc.setTextColor(...GRAY);
    const labW = doc.getTextWidth(items[i].label);
    doc.text(items[i].label, bx + (boxW - labW) / 2, y + 13);

    // Thin separator line between items
    if (i < items.length - 1) {
      doc.setDrawColor(...LGRAY); doc.setLineWidth(0.2);
      doc.line(bx + boxW, y - 2, bx + boxW, y + 16);
    }
  }
  y += 20;
}

// ── Thin orange separator ──

function separator() {
  y += 5;
  ck(8);
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.3);
  doc.line(ML, y, ML + 30, y);
  y += 6;
}

// ── Part divider page ──

function partDivider(num, title, subtitle) {
  doc.addPage();

  // White page with minimal accent
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, PW, PH, "F");

  // Thin orange bar at top
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, PW, 3, "F");

  // Part label
  sf("normal", 11); doc.setTextColor(...ORANGE);
  const partLabel = `Part ${num}`;
  doc.text(partLabel, ML, 80);

  // Title
  sf("bold", 34); doc.setTextColor(...BLACK);
  doc.text(title, ML, 100);

  // Thin orange underline
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(1);
  doc.line(ML, 106, ML + 50, 106);

  // Subtitle
  sf("normal", 12); doc.setTextColor(...GRAY);
  const stLines = doc.splitTextToSize(subtitle, CW - 20);
  let sy = 118;
  for (const l of stLines) { doc.text(l, ML, sy); sy += 7; }

  // Cream block bottom
  doc.setFillColor(...CREAM);
  doc.rect(0, PH - 30, PW, 30, "F");
  sf("normal", 8); doc.setTextColor(...GRAY);
  doc.text("Lightning A11y Lab  |  NextGen Experience Lab", ML, PH - 14);
}

// ── Footer on all content pages ──

function addFooters() {
  const tp = doc.getNumberOfPages();
  for (let i = 2; i <= tp; i++) {
    doc.setPage(i);
    // Thin line
    doc.setDrawColor(...LGRAY); doc.setLineWidth(0.2);
    doc.line(ML, PH - 16, ML + CW, PH - 16);
    // Left: branding
    sf("normal", 7); doc.setTextColor(...GRAY);
    doc.text("Lightning A11y Lab  |  NextGen Experience Lab \u2013 Designing quality at scale", ML, PH - 11);
    // Right: page number
    const pt = `${i - 1}`;
    doc.text(pt, PW - MR - doc.getTextWidth(pt), PH - 11);
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function generate() {
  doc = new jsPDF({ unit: "mm", format: "a4" });

  // ═══ COVER PAGE ═══
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, PW, PH, "F");

  // Top orange bar
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, PW, 6, "F");

  // Cream stripe across middle
  doc.setFillColor(...CREAM);
  doc.rect(0, 80, PW, 95, "F");

  // Document type
  sf("normal", 9); doc.setTextColor(...ORANGE);
  doc.text("ACCESSIBILITY & TOOL OVERVIEW", ML, 40);

  // Thin orange line
  doc.setDrawColor(...ORANGE); doc.setLineWidth(0.5);
  doc.line(ML, 44, ML + 40, 44);

  // Main title
  sf("bold", 34); doc.setTextColor(...BLACK);
  doc.text("Lightning", ML, 65);
  doc.text("A11y Lab", ML, 78);

  // Tagline inside cream band
  sf("italic", 12); doc.setTextColor(...GRAY);
  doc.text("Helping Salesforce teams ship accessible", ML, 100);
  doc.text("experiences with confidence", ML, 110);

  // Team section
  sf("bold", 9); doc.setTextColor(...ORANGE);
  doc.text("TEAM", ML, 132);

  sf("bold", 10); doc.setTextColor(...BLACK);
  doc.text("NextGen Experience Lab", ML, 141);
  sf("italic", 9); doc.setTextColor(...GRAY);
  doc.text("\u2013 Designing quality at scale", ML, 148);

  sf("normal", 9); doc.setTextColor(...BLACK);
  doc.text("Perooru Subbanarasaiah", ML, 160);
  sf("normal", 8); doc.setTextColor(...GRAY);
  doc.text("User Experience", ML + 50, 160);

  sf("normal", 9); doc.setTextColor(...BLACK);
  doc.text("Naveen Kumar Gurramkonda", ML, 168);
  sf("normal", 8); doc.setTextColor(...GRAY);
  doc.text("Testing Expert", ML + 58, 168);

  // Contents
  sf("bold", 9); doc.setTextColor(...ORANGE);
  doc.text("CONTENTS", ML, 200);

  sf("normal", 9.5); doc.setTextColor(...BLACK);
  doc.text("Part 1", ML, 210);
  sf("normal", 9.5); doc.setTextColor(...GRAY);
  doc.text("Understanding Web Accessibility", ML + 20, 210);

  sf("normal", 9.5); doc.setTextColor(...BLACK);
  doc.text("Part 2", ML, 218);
  sf("normal", 9.5); doc.setTextColor(...GRAY);
  doc.text("Introducing Lightning A11y Lab", ML + 20, 218);

  // Bottom bar
  doc.setFillColor(...ORANGE);
  doc.rect(0, PH - 6, PW, 6, "F");

  sf("normal", 8); doc.setTextColor(...GRAY);
  doc.text("April 2026", ML, PH - 14);

  // ═══ PART 1 ═══
  partDivider(1, "Understanding", "What is web accessibility, why it matters,\nand what every team should know");

  doc.addPage(); y = MT;

  h1("What Is Web Accessibility?");
  txt("Web accessibility means designing and building digital experiences that every person can perceive, understand, navigate, and interact with \u2014 regardless of their abilities, disabilities, or the technology they use.");
  y += 3;
  txt("When we say \u201Caccessible,\u201D we mean a person who is blind can use a screen reader to navigate your application. A person with limited mobility can complete every task using only a keyboard. A person with low vision can read content because text has sufficient contrast. A person with a cognitive disability can understand an interface because it uses clear labels, consistent patterns, and plain language.");
  y += 4;
  callout("Accessibility is not a special feature added at the end. It is a fundamental quality of well-built software.");

  h1("Who Benefits from Accessibility?");

  stats([
    { num: "1.3B", label: "People with disabilities" },
    { num: "16%", label: "of global population" },
    { num: "8%", label: "Males are color-blind" },
    { num: "100%", label: "Everyone benefits" },
  ]);

  h3("People with permanent disabilities");
  bullet("Visual impairments, hearing loss, motor/mobility limitations, cognitive and neurological conditions, and speech disabilities");
  bullet("These users rely on assistive technologies \u2014 screen readers, switch devices, eye-tracking, magnification, voice control \u2014 that only work when applications are built accessibly");

  h3("People with temporary or situational limitations");
  bullet("A broken arm, an eye infection, a noisy environment, bright sunlight, holding a baby \u2014 everyday situations where accessible design helps");
  bullet("Captions help someone in a loud room just as much as someone who is deaf");

  h3("Aging populations and all users");
  txt("As people age, vision, hearing, motor skills, and cognitive processing change. Accessible interfaces accommodate these changes. Clear headings, labeled fields, logical tab order, sufficient contrast, and predictable navigation make every interface easier for everyone.");

  separator();

  h1("Why Accessibility Matters");

  h2("Legal and regulatory requirements");
  txt("Accessibility is not optional in many jurisdictions:");
  table(
    ["Regulation", "Scope", "Key requirement"],
    [
      ["ADA", "US \u2014 public and private entities", "Digital services must be accessible; courts apply WCAG 2.1 AA"],
      ["Section 508", "US \u2014 federal agencies and contractors", "ICT must conform to WCAG 2.0 AA (updated to 2.1)"],
      ["European Accessibility Act", "EU \u2014 effective June 2025", "Digital products and services must meet accessibility requirements"],
      ["AODA", "Ontario, Canada", "Public and large private organizations must meet WCAG 2.0 AA"],
      ["EN 301 549", "European Union", "Harmonized ICT accessibility standard, references WCAG 2.1 AA"],
    ],
    { colWidths: [38, 44, CW - 82] }
  );
  callout("ADA-related digital accessibility lawsuits increased over 300% between 2018 and 2023.");

  h2("Business value");
  bullet("Larger addressable market \u2014 15\u201320% of any user base has some form of disability", { bold: true });
  bullet("Improved SEO \u2014 semantic HTML, alt text, and labeled controls improve search indexing", { bold: true });
  bullet("Reduced support costs \u2014 clear interfaces generate fewer help tickets", { bold: true });
  bullet("Brand reputation \u2014 inclusive design earns trust from clients and employees", { bold: true });

  h2("Better engineering quality");
  txt("Accessible code is well-structured code. Semantic HTML, proper heading hierarchies, labeled form controls, and managed keyboard focus make codebases more maintainable, testable, and consistent.");

  separator();

  h1("Understanding WCAG");
  txt("WCAG (Web Content Accessibility Guidelines) is the internationally recognized standard for web accessibility, published by the W3C.");
  y += 3;

  h2("Four principles (POUR)");
  table(
    ["Principle", "What it means", "Example"],
    [
      ["Perceivable", "Users can perceive the information", "Images have alt text; text has sufficient contrast"],
      ["Operable", "Users can operate the interface", "All functions work with keyboard; predictable navigation"],
      ["Understandable", "Users understand content and UI", "Clear labels; described errors; consistent behavior"],
      ["Robust", "Content works across technologies", "Valid HTML; proper ARIA; works with assistive technologies"],
    ],
    { colWidths: [28, 46, CW - 74] }
  );

  h2("Conformance levels");
  table(
    ["Level", "Coverage", "Typical requirement"],
    [
      ["A", "Minimum \u2014 most severe barriers", "Baseline for all projects"],
      ["AA", "Most common barriers, widest reach", "Required by most laws and contracts"],
      ["AAA", "Highest \u2014 specialized needs", "Aspirational; specific content types"],
    ],
    { colWidths: [18, 54, CW - 72] }
  );

  h2("Versions");
  table(
    ["Version", "Status", "Key additions"],
    [
      ["WCAG 2.0", "Published 2008", "Foundational 61 success criteria"],
      ["WCAG 2.1", "Published 2018, widely adopted", "Mobile, low vision, cognitive (78 total)"],
      ["WCAG 2.2", "Published 2023, current", "Focus appearance, dragging alternatives (87 total)"],
    ],
    { colWidths: [22, 50, CW - 72] }
  );
  callout("Most current projects target WCAG 2.1 AA or WCAG 2.2 AA.");

  separator();

  h1("Common Accessibility Issues");
  txt("These patterns cause the most audit failures and real-world barriers:");
  table(
    ["Issue", "What goes wrong", "Who is affected"],
    [
      ["Missing alt text", "Screen readers say \u201Cimage\u201D with no description", "Blind and low-vision users"],
      ["Missing form labels", "Screen readers can\u2019t identify fields", "Blind users; voice control users"],
      ["Poor heading hierarchy", "Skipping levels or headings for styling only", "Screen reader navigation users"],
      ["Insufficient contrast", "Text blends into background", "Low-vision; bright environments"],
      ["Color as only indicator", "\u201CRed = error\u201D without text or icon", "Color-blind users (8% of males)"],
      ["Keyboard traps", "Focus enters component, cannot leave", "Keyboard-only; switch device users"],
      ["Missing landmarks", "No <main>, <nav>, <header>", "Screen reader landmark navigation"],
      ["Invalid ARIA roles", "Misused roles cause confusion", "All assistive technology users"],
      ["No focus indicator", "Can\u2019t see keyboard focus position", "Keyboard-only users"],
      ["Inaccessible modals", "Focus not managed, no close mechanism", "Keyboard and screen reader users"],
    ],
    { colWidths: [36, 56, CW - 92] }
  );
  callout("Every one of these issues is detectable through static analysis of markup \u2014 before code reaches production.");

  h1("The Cost of Catching Late");
  table(
    ["Stage defect is found", "Relative cost", "Risk level"],
    [
      ["During development", "1\u00D7 (baseline)", "Low \u2014 contained to developer"],
      ["During QA / testing", "3\u20135\u00D7", "Medium \u2014 requires test cycle"],
      ["During UAT / governance", "10\u00D7", "High \u2014 delays release"],
      ["Post-deployment", "30\u2013100\u00D7", "Critical \u2014 legal exposure; brand damage"],
    ],
    { colWidths: [48, 35, CW - 83] }
  );
  callout("Catching accessibility issues in markup \u2014 before code reaches a sandbox \u2014 is the most cost-effective quality strategy available.");

  // ═══ PART 2 ═══
  partDivider(2, "Lightning A11y Lab", "A multi-surface accessibility review platform\nfor Salesforce Lightning markup");

  doc.addPage(); y = MT;

  h1("The Problem We Solve");
  txt("Salesforce delivery teams build LWC and Aura components reaching thousands of enterprise end users \u2014 including people who rely on screen readers, keyboards, magnification, or voice control. Yet accessibility reviews are:");
  y += 2;
  bullet("Manual \u2014 a QA engineer walks through a checklist, one component at a time", { bold: true });
  bullet("Late \u2014 reviews happen during UAT, after patterns have propagated", { bold: true });
  bullet("Inconsistent \u2014 different reviewers catch different things", { bold: true });
  bullet("Undocumented \u2014 findings live in spreadsheets, disconnected from code", { bold: true });
  y += 3;
  callout("Lightning A11y Lab replaces this with an automated, consistent, and documented review process at every stage of development.");

  h1("What Is Lightning A11y Lab?");

  stats([
    { num: "34", label: "Static analysis checks" },
    { num: "33", label: "Remediation guides" },
    { num: "3", label: "Delivery surfaces" },
    { num: "0", label: "Data exfiltration risk" },
  ]);

  txt("A multi-surface static analysis platform purpose-built for Salesforce Lightning markup, covering:");
  y += 2;
  bullet("Accessibility \u2014 ARIA, labels, headings, landmarks, focus management");
  bullet("UX consistency \u2014 SLDS patterns, component structure");
  bullet("Mobile responsiveness \u2014 viewport, touch targets");
  bullet("SEO and discoverability \u2014 meta, semantic structure");
  y += 2;
  txt("Every finding includes severity, affected line, WCAG success criterion, step-by-step remediation, and reference links to W3C, MDN, SLDS, and Trailhead.");

  separator();

  h1("Three Surfaces, One Engine");

  h2("1. Browser-based review console");
  bullet("Paste markup or fetch HTML from any live URL via Cloudflare Worker proxy");
  bullet("Configure WCAG version (2.1 / 2.2) and level (A / AA / AAA)");
  bullet("Review findings with severity-ranked cards, filters, and search");
  bullet("Export results as JSON, Word, or PDF for governance workflows");
  bullet("No installation, no account, no data leaving your browser");

  h2("2. CLI tool (a11y-review)");
  bullet("Scan individual files or entire directories from the terminal");
  bullet("Output as colored table, JSON, or JUnit XML for CI integration");
  bullet("--fail-on flag for CI pipeline gates (fail on major+ findings)");
  bullet("Integrates with Jenkins, GitHub Actions, Azure DevOps");

  h2("3. VS Code extension");
  bullet("Inline squiggly diagnostics on LWC / Aura HTML files");
  bullet("Status bar indicator with real-time issue count and severity coloring");
  bullet("Review on save (configurable) \u2014 findings update as you code");
  bullet("\u201CReview All Components\u201D \u2014 scans every component in the workspace");

  separator();

  h1("Architecture");
  codeBlock(
    "@a11y-lab/core (shared engine \u2014 34 checks, 33 remediation guides)\n" +
    "       |\n" +
    "       +\u2014 Web app (React 18 + Vite \u2192 GitHub Pages)\n" +
    "       +\u2014 CLI tool (a11y-review \u2192 terminal / CI pipelines)\n" +
    "       +\u2014 VS Code extension (inline diagnostics + status bar)"
  );

  h3("Key decisions");
  bullet("Zero server dependency \u2014 all analysis runs client-side; no data leaves the user\u2019s environment", { bold: true });
  bullet("Salesforce-aware rules \u2014 understands lightning-input, lightning-card, SLDS classes, Aura conventions", { bold: true });
  bullet("Multi-dimensional scoring \u2014 Performance, Accessibility, Best Practices, SEO lenses, each 0\u2013100", { bold: true });
  bullet("Educational by design \u2014 33 guides teach why each pattern matters, not just what to fix", { bold: true });

  h1("Workflow Integration");
  codeBlock(
    "Developer writes LWC / Aura component\n" +
    "       |\n" +
    "       +\u2014 VS Code extension flags issues in real time\n" +
    "       |\n" +
    "       +\u2014 Web console for deeper review and export\n" +
    "       |\n" +
    "       +\u2014 CI pipeline blocks merge on critical / major findings\n" +
    "       |\n" +
    "       +\u2014 QA reviews exported findings (Word / PDF)\n" +
    "       |\n" +
    "       +\u2014 Governance team receives evidence package"
  );
  callout("Four catch points across the development lifecycle \u2014 issues found at the earliest and cheapest stage.");

  separator();

  h1("Technology Stack");
  table(
    ["Layer", "Technology"],
    [
      ["Shared analysis engine", "@a11y-lab/core (TypeScript, zero dependencies)"],
      ["Web app", "React 18 + TypeScript, Vite 5, React Router v7"],
      ["CLI tool", "Node.js + @a11y-lab/core"],
      ["VS Code extension", "VS Code Extension API + @a11y-lab/core"],
      ["Exports", "jsPDF (PDF), docx (Word), JSON"],
      ["CORS proxy", "Cloudflare Workers"],
      ["Deployment", "GitHub Pages + GitHub Actions CI/CD"],
      ["Monorepo", "npm workspaces"],
      ["Standards", "WCAG 2.1, WCAG 2.2, WAI-ARIA 1.2, SLDS"],
    ],
    { colWidths: [42, CW - 42] }
  );

  h1("Additional Features");
  bullet("Accessibility Resources page \u2014 36 curated links across 6 categories");
  bullet("7 visual themes with persistent preference (including PwC theme)");
  bullet("Live URL fetching via Cloudflare Worker CORS proxy");
  bullet("Input validation with styled error messaging");
  bullet("Marketing landing page with team profiles, FAQ, and impact content");

  separator();

  h1("Impact Summary");

  stats([
    { num: "~95%", label: "Time saved per review" },
    { num: "$50K", label: "Max savings / engagement" },
    { num: "6", label: "Export formats" },
    { num: "36", label: "Curated resources" },
  ]);

  table(
    ["Metric", "Value"],
    [
      ["Static analysis checks", "34"],
      ["Remediation guides", "33 (with fix steps, importance, external links)"],
      ["Delivery surfaces", "3 (web app, CLI, VS Code extension)"],
      ["Export formats", "6 (JSON, Word, PDF on web; table, JSON, JUnit on CLI)"],
      ["WCAG coverage", "2.1 and 2.2, levels A / AA / AAA"],
      ["Server dependencies", "0 (all analysis runs client-side)"],
      ["Data exfiltration risk", "0 (nothing leaves the user\u2019s machine)"],
      ["Estimated cost savings", "$12,600\u2013$50,000 per engagement"],
    ],
    { colWidths: [50, CW - 50] }
  );

  // Closing
  y += 6; ck(16);
  doc.setFillColor(...CREAM);
  doc.roundedRect(ML, y - 2, CW, 16, 2, 2, "F");
  sf("bold", 11); doc.setTextColor(...BLACK);
  doc.text("Lightning A11y Lab", ML + 6, y + 4);
  sf("normal", 9); doc.setTextColor(...GRAY);
  doc.text("NextGen Experience Lab \u2013 Designing quality at scale", ML + 6, y + 10);

  // ── Footers ──
  addFooters();

  const { writeFileSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  const outPath = resolve(process.cwd(), "ACCESSIBILITY-AND-TOOL-OVERVIEW.pdf");
  writeFileSync(outPath, Buffer.from(doc.output("arraybuffer")));
  console.log(`\u2705 PDF written \u2192 ${outPath}`);
}

generate();
