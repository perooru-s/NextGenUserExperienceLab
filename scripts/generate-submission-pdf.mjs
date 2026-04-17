/**
 * Generates a polished PDF from the hackathon submission content.
 * Run: node scripts/generate-submission-pdf.mjs
 * Output: SUBMISSION-CONTENT.pdf
 */
import { jsPDF } from "jspdf";

const MARGIN_LEFT = 22;
const MARGIN_RIGHT = 22;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const PAGE_HEIGHT = 297;
const MARGIN_TOP = 22;
const MARGIN_BOTTOM = 22;
const LINE_HEIGHT = 5.2;

const COLORS = {
  black: [30, 30, 30],
  heading: [20, 60, 120],
  subheading: [35, 80, 145],
  accent: [0, 102, 178],
  muted: [100, 100, 100],
  tableBorder: [200, 200, 200],
  tableHeader: [235, 241, 250],
  tableStripe: [248, 250, 253],
  white: [255, 255, 255],
  divider: [0, 102, 178],
  coverBg: [20, 60, 120],
  coverAccent: [0, 180, 216],
  bulletGreen: [34, 139, 34],
};

let doc;
let y;

function checkPage(needed = LINE_HEIGHT * 2) {
  if (y + needed > PAGE_HEIGHT - MARGIN_BOTTOM) {
    doc.addPage();
    y = MARGIN_TOP;
    return true;
  }
  return false;
}

function setFont(style = "normal", size = 10) {
  doc.setFontSize(size);
  doc.setFont("helvetica", style);
}

function addText(text, opts = {}) {
  const {
    x = MARGIN_LEFT,
    maxWidth = CONTENT_WIDTH,
    size = 10,
    style = "normal",
    color = COLORS.black,
    lineHeight = LINE_HEIGHT,
    indent = 0,
  } = opts;

  setFont(style, size);
  doc.setTextColor(...color);

  const effectiveX = x + indent;
  const effectiveWidth = maxWidth - indent;
  const lines = doc.splitTextToSize(text, effectiveWidth);

  for (const line of lines) {
    checkPage(lineHeight);
    doc.text(line, effectiveX, y);
    y += lineHeight;
  }
}

function addHeading(text, level = 1) {
  const configs = {
    1: { size: 18, color: COLORS.heading, style: "bold", spaceBefore: 12, spaceAfter: 4 },
    2: { size: 14, color: COLORS.heading, style: "bold", spaceBefore: 10, spaceAfter: 3 },
    3: { size: 11.5, color: COLORS.subheading, style: "bold", spaceBefore: 8, spaceAfter: 2.5 },
  };
  const cfg = configs[level] || configs[2];

  y += cfg.spaceBefore;
  checkPage(cfg.size + 10);

  if (level === 1) {
    doc.setDrawColor(...COLORS.divider);
    doc.setLineWidth(0.6);
    doc.line(MARGIN_LEFT, y - 3, MARGIN_LEFT + CONTENT_WIDTH, y - 3);
    y += 3;
  }

  addText(text, { size: cfg.size, style: cfg.style, color: cfg.color });
  y += cfg.spaceAfter;
}

function addBullet(text, opts = {}) {
  const { indent = 0, bold = false } = opts;
  const bulletX = MARGIN_LEFT + 4 + indent;
  const textX = bulletX + 5;
  const textWidth = CONTENT_WIDTH - 9 - indent;

  checkPage(LINE_HEIGHT * 2);

  doc.setFillColor(...COLORS.accent);
  doc.circle(bulletX + 1, y - 1.3, 1, "F");

  if (bold && text.includes(" — ")) {
    const dashIdx = text.indexOf(" — ");
    const boldPart = text.substring(0, dashIdx);
    const restPart = text.substring(dashIdx);

    setFont("bold", 10);
    doc.setTextColor(...COLORS.black);
    const boldWidth = doc.getTextWidth(boldPart);

    const fullText = boldPart + restPart;
    const lines = doc.splitTextToSize(fullText, textWidth);

    for (let i = 0; i < lines.length; i++) {
      checkPage();
      if (i === 0) {
        doc.setFont("helvetica", "bold");
        doc.text(boldPart, textX, y);
        doc.setFont("helvetica", "normal");
        const restOfFirstLine = lines[0].substring(boldPart.length);
        if (restOfFirstLine) {
          doc.text(restOfFirstLine, textX + boldWidth, y);
        }
      } else {
        doc.setFont("helvetica", "normal");
        doc.text(lines[i], textX, y);
      }
      y += LINE_HEIGHT;
    }
  } else {
    addText(text, { x: textX, maxWidth: textWidth, style: bold ? "bold" : "normal" });
  }
  y += 1;
}

function addNumberedItem(num, text) {
  const numX = MARGIN_LEFT + 4;
  const textX = numX + 8;
  const textWidth = CONTENT_WIDTH - 12;

  checkPage(LINE_HEIGHT * 2);

  setFont("bold", 10);
  doc.setTextColor(...COLORS.accent);
  doc.text(`${num}.`, numX, y);

  if (text.includes(" — ")) {
    const dashIdx = text.indexOf(" — ");
    const boldPart = text.substring(0, dashIdx);
    const rest = text.substring(dashIdx);
    const full = boldPart + rest;
    const lines = doc.splitTextToSize(full, textWidth);

    for (let i = 0; i < lines.length; i++) {
      checkPage();
      if (i === 0) {
        setFont("bold", 10);
        doc.setTextColor(...COLORS.black);
        const bw = doc.getTextWidth(boldPart);
        doc.text(boldPart, textX, y);
        setFont("normal", 10);
        const restLine = lines[0].substring(boldPart.length);
        if (restLine) doc.text(restLine, textX + bw, y);
      } else {
        setFont("normal", 10);
        doc.setTextColor(...COLORS.black);
        doc.text(lines[i], textX, y);
      }
      y += LINE_HEIGHT;
    }
  } else {
    addText(text, { x: textX, maxWidth: textWidth });
  }
  y += 1.5;
}

function addTable(headers, rows, opts = {}) {
  const { colWidths } = opts;
  const numCols = headers.length;
  const defaultColWidth = CONTENT_WIDTH / numCols;
  const widths = colWidths || headers.map(() => defaultColWidth);

  const cellPadding = 2.5;
  const cellFontSize = 8.5;
  const headerFontSize = 8.5;

  function getRowHeight(row) {
    let maxLines = 1;
    for (let c = 0; c < row.length; c++) {
      setFont("normal", cellFontSize);
      const lines = doc.splitTextToSize(String(row[c] || ""), widths[c] - cellPadding * 2);
      if (lines.length > maxLines) maxLines = lines.length;
    }
    return maxLines * (LINE_HEIGHT - 0.5) + cellPadding * 2;
  }

  y += 3;

  const headerHeight = getRowHeight(headers) + 1;
  checkPage(headerHeight + 20);

  let cx = MARGIN_LEFT;
  doc.setFillColor(...COLORS.tableHeader);
  doc.rect(MARGIN_LEFT, y - 3, CONTENT_WIDTH, headerHeight, "F");

  for (let c = 0; c < numCols; c++) {
    setFont("bold", headerFontSize);
    doc.setTextColor(...COLORS.heading);
    const lines = doc.splitTextToSize(headers[c], widths[c] - cellPadding * 2);
    let ty = y;
    for (const line of lines) {
      doc.text(line, cx + cellPadding, ty);
      ty += LINE_HEIGHT - 0.5;
    }
    cx += widths[c];
  }

  y += headerHeight - 2;

  for (let r = 0; r < rows.length; r++) {
    const rowHeight = getRowHeight(rows[r]);
    checkPage(rowHeight + 2);

    if (r % 2 === 1) {
      doc.setFillColor(...COLORS.tableStripe);
      doc.rect(MARGIN_LEFT, y - 3, CONTENT_WIDTH, rowHeight, "F");
    }

    doc.setDrawColor(...COLORS.tableBorder);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_LEFT, y - 3, MARGIN_LEFT + CONTENT_WIDTH, y - 3);

    cx = MARGIN_LEFT;
    for (let c = 0; c < numCols; c++) {
      setFont("normal", cellFontSize);
      doc.setTextColor(...COLORS.black);
      const cellText = String(rows[r][c] || "");

      if (c === 0 && numCols > 2) {
        setFont("bold", cellFontSize);
      }

      const lines = doc.splitTextToSize(cellText, widths[c] - cellPadding * 2);
      let ty = y;
      for (const line of lines) {
        doc.text(line, cx + cellPadding, ty);
        ty += LINE_HEIGHT - 0.5;
      }
      cx += widths[c];
    }
    y += rowHeight - 2;
  }

  doc.setDrawColor(...COLORS.tableBorder);
  doc.setLineWidth(0.2);
  doc.line(MARGIN_LEFT, y - 1, MARGIN_LEFT + CONTENT_WIDTH, y - 1);

  y += 4;
}

function addCodeBlock(text) {
  checkPage(20);
  y += 2;

  setFont("normal", 8.5);
  const lines = text.split("\n");
  const blockHeight = lines.length * 4.5 + 6;

  checkPage(blockHeight);

  doc.setFillColor(245, 245, 248);
  doc.setDrawColor(210, 210, 215);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN_LEFT, y - 4, CONTENT_WIDTH, blockHeight, 2, 2, "FD");

  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);

  let ty = y;
  for (const line of lines) {
    doc.text(line, MARGIN_LEFT + 4, ty);
    ty += 4.5;
  }
  y += blockHeight + 2;
}

function addDivider() {
  y += 4;
  checkPage(8);
  doc.setDrawColor(...COLORS.tableBorder);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_LEFT, y, MARGIN_LEFT + CONTENT_WIDTH, y);
  y += 6;
}

function addCoverPage() {
  doc.setFillColor(...COLORS.coverBg);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  doc.setFillColor(...COLORS.coverAccent);
  doc.rect(0, 90, PAGE_WIDTH, 4, "F");

  setFont("bold", 32);
  doc.setTextColor(255, 255, 255);
  const title = "Lightning A11y Lab";
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (PAGE_WIDTH - titleWidth) / 2, 120);

  setFont("normal", 14);
  doc.setTextColor(180, 210, 240);
  const subtitle = "Hackathon Submission";
  const subWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (PAGE_WIDTH - subWidth) / 2, 132);

  doc.setFillColor(...COLORS.coverAccent);
  doc.rect(PAGE_WIDTH / 2 - 20, 140, 40, 0.8, "F");

  setFont("bold", 12);
  doc.setTextColor(255, 255, 255);
  const team = "NextGen Experience Lab";
  const teamW = doc.getTextWidth(team);
  doc.text(team, (PAGE_WIDTH - teamW) / 2, 155);

  setFont("italic", 11);
  doc.setTextColor(180, 210, 240);
  const tagline = "Designing quality at scale";
  const tagW = doc.getTextWidth(tagline);
  doc.text(tagline, (PAGE_WIDTH - tagW) / 2, 164);

  setFont("normal", 10);
  doc.setTextColor(160, 190, 220);
  const items = [
    "Multi-surface accessibility review platform",
    "for Salesforce Lightning markup",
    "",
    "34 Static Checks  |  3 Delivery Surfaces  |  Zero Data Exfiltration",
  ];
  let iy = 185;
  for (const item of items) {
    const iw = doc.getTextWidth(item);
    doc.text(item, (PAGE_WIDTH - iw) / 2, iy);
    iy += 7;
  }

  setFont("normal", 9);
  doc.setTextColor(140, 170, 200);
  const surfaces = "Web App  •  CLI Tool  •  VS Code Extension";
  const sw = doc.getTextWidth(surfaces);
  doc.text(surfaces, (PAGE_WIDTH - sw) / 2, 220);

  setFont("normal", 8);
  doc.setTextColor(120, 150, 180);
  const date = "April 2026";
  const dw = doc.getTextWidth(date);
  doc.text(date, (PAGE_WIDTH - dw) / 2, 270);
}

function addPageNumbers() {
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    setFont("normal", 8);
    doc.setTextColor(...COLORS.muted);
    const pageText = `${i - 1} / ${totalPages - 1}`;
    const pw = doc.getTextWidth(pageText);
    doc.text(pageText, PAGE_WIDTH - MARGIN_RIGHT - pw, PAGE_HEIGHT - 10);

    doc.setTextColor(160, 190, 220);
    doc.text("Lightning A11y Lab — Hackathon Submission", MARGIN_LEFT, PAGE_HEIGHT - 10);
  }
}

async function generate() {
  doc = new jsPDF({ unit: "mm", format: "a4" });

  // ── Cover Page ──
  addCoverPage();

  // ── Page 2+: Content ──
  doc.addPage();
  y = MARGIN_TOP;

  // ━━ Business Case ━━
  addHeading("Business Case", 1);

  addBullet("Problem — UX and accessibility issues in Salesforce are often identified late (QA/UAT), causing rework, delays, and inconsistent user experiences; manual reviews are slow and hard to scale.", { bold: true });
  addBullet("Solution — A multi-surface accessibility review platform — browser app, CLI tool, and VS Code extension — that analyzes Salesforce LWC/Aura markup to automatically detect accessibility gaps, UX inconsistencies, and SLDS pattern issues early in development.", { bold: true });
  addBullet("Business Impact — Reduces late-stage defects and rework, improves delivery quality and consistency, and saves time by automating UX and accessibility reviews across every stage of the development workflow.", { bold: true });
  addBullet("CSX Value — Aligns with AI-enabled client delivery and productivity goals, embeds responsible and inclusive design into CSX delivery workflows, and creates a reusable accelerator across Salesforce engagements.", { bold: true });

  // ━━ Business Use Case and Impact ━━
  addHeading("Business Use Case and Impact", 1);

  addText("Salesforce delivery teams routinely ship LWC and Aura components that reach enterprise end users — including people who rely on screen readers, keyboards, or magnification. Yet accessibility defects are typically caught late: during UAT, governance sign-off, or worse, after a formal ADA/Section 508 complaint. Remediating at that stage is 4× more expensive than fixing at the code level, and a single overlooked pattern (e.g. an unlabeled input) often propagates across dozens of components before anyone notices.");
  y += 3;
  addText("Lightning A11y Lab addresses this by giving developers and QA a shared review platform that catches WCAG violations at the markup stage — before code reaches a sandbox or production org. It ships as three complementary surfaces:");
  y += 2;

  addNumberedItem(1, "Browser-based review console — paste markup or fetch a live URL, run 34 static checks, review severity-ranked findings with remediation guidance, and export results");
  addNumberedItem(2, 'CLI tool (a11y-review) — scan files or directories from the terminal or CI pipelines, with table, JSON, and JUnit output formats');
  addNumberedItem(3, "VS Code extension — inline diagnostics, status bar summary, review-on-save, and workspace-wide scanning for LWC/Aura HTML files");

  y += 2;
  addHeading("Impact", 3);
  addBullet("Shift-left accessibility — developers catch issues during development, not after deployment", { bold: true });
  addBullet("Reduced audit remediation costs — findings are severity-ranked and mapped to specific WCAG criteria, so teams fix the right things first", { bold: true });
  addBullet("Governance-ready evidence — structured exports (JSON, Word, PDF, JUnit) attach directly to release tickets, pull requests, CI dashboards, or audit evidence packages", { bold: true });
  addBullet("Zero friction adoption — the web app runs entirely in the browser with no account, no installation, and no data leaving the user's machine", { bold: true });
  addBullet("Broader user reach — helps teams build digital experiences that work for the 1+ billion people worldwide who experience some form of disability", { bold: true });

  // ━━ Solution / Approach Overview ━━
  addHeading("Solution / Approach Overview", 1);

  addText("Lightning A11y Lab is a multi-surface static analysis platform purpose-built for Salesforce Lightning markup. It is organized as a monorepo with a shared core analysis engine consumed by three delivery surfaces.");
  y += 3;

  addHeading("Architecture", 3);
  addCodeBlock(
    "@a11y-lab/core (shared engine — 34 checks, 33 remediation guides)\n" +
    "       │\n" +
    "       ├── Web app (React + Vite → GitHub Pages)\n" +
    "       ├── CLI tool (a11y-review → terminal / CI pipelines)\n" +
    "       └── VS Code extension (inline diagnostics + status bar)"
  );

  addHeading("Web App Workflow", 3);
  addNumberedItem(1, "Paste LWC, Aura, or raw HTML markup into the review console — or fetch HTML from a live URL (via a Cloudflare Worker CORS proxy)");
  addNumberedItem(2, "Configure the WCAG target — version (2.1 or 2.2) and conformance level (A, AA, or AAA)");
  addNumberedItem(3, "Run the analysis — the engine performs 34 static checks covering accessibility, mobile responsiveness, UX consistency, and SLDS patterns");
  addNumberedItem(4, "Review findings — each one shows severity, affected line, WCAG success criterion, remediation steps, and reference links");
  addNumberedItem(5, "Export results as JSON, Word, or PDF for governance workflows");

  addHeading("CLI Workflow", 3);
  addCodeBlock(
    "npx a11y-review force-app/main/default/lwc --wcag-level AA --format table\n" +
    "npx a11y-review force-app/ --format junit > a11y-results.xml"
  );
  addBullet("Scan individual files or recursively scan directories");
  addBullet("Output as colored table (human), JSON (machine), or JUnit XML (CI integration)");
  addBullet("--fail-on flag for CI gates (e.g. --fail-on major fails the build if any major+ findings exist)");

  addHeading("VS Code Extension", 3);
  addBullet("Inline squiggly diagnostics on LWC/Aura HTML files — findings appear in the Problems panel");
  addBullet("Status bar indicator showing issue count with severity coloring");
  addBullet("Review on save (configurable) — findings update automatically as you work");
  addBullet("Review All Components command — scans every lwc/, aura/, force-app/ HTML file in the workspace");

  addHeading("Key Technical Decisions", 3);
  addBullet("All analysis runs client-side — no server, no API calls, no data exfiltration risk", { bold: true });
  addBullet("Salesforce-aware rules — checks understand lightning-input labels, lightning-card titles, SLDS class conventions, and Aura component structures", { bold: true });
  addBullet("Multi-dimensional scoring — findings grouped into Performance, Accessibility, Best Practices, and SEO & Discoverability lenses, each scored 0–100", { bold: true });
  addBullet("Educational layer — every finding includes importance context, step-by-step fix guidance, and links to W3C, MDN, SLDS, and Trailhead documentation (33 curated guide entries)", { bold: true });
  addBullet("Shared core engine — one analysis library (@a11y-lab/core) consumed by all three surfaces via npm workspaces", { bold: true });

  addHeading("Additional Features", 3);
  addBullet("Curated Accessibility Resources page (36 links across 6 categories) with search and jump navigation");
  addBullet("7 visual themes with localStorage persistence");
  addBullet("Input validation with styled error feedback");
  addBullet("Marketing landing page with team profiles, FAQ, and accessibility impact content");

  // ━━ Category Selection ━━
  addHeading("Category Selection — Client Delivery", 1);

  addText("Lightning A11y Lab directly improves the quality of what gets delivered to clients on Salesforce projects:");
  y += 2;
  addNumberedItem(1, "It sits in the delivery pipeline — developers use the VS Code extension during active coding, the CLI tool runs in CI pipelines, and QA uses the browser console for review.");
  addNumberedItem(2, "It solves a real delivery risk — accessibility defects caught post-deployment cause rework, delay releases, and expose clients to ADA/Section 508 legal risk.");
  addNumberedItem(3, "It produces governance artifacts — the JSON, Word, PDF, and JUnit exports are designed to attach to release tickets, CI dashboards, and audit evidence packages.");
  addNumberedItem(4, "It's Salesforce-specific — the checks are built around Lightning component patterns that matter in actual client engagements, not generic web rules.");

  y += 2;
  addTable(
    ["Category", "Why it's not the primary fit"],
    [
      ["Productivity Boost", "The tool saves developer time, but its core purpose is improving delivery quality, not speeding up individual tasks"],
      ["Data & Insights", "It produces findings and scores, but the goal is remediation, not analytics or reporting as a primary value"],
      ["Innovation", "It uses a novel approach, but the value proposition is practical delivery improvement"],
      ["Cross-Platform Collaboration", "While the shared core enables multiple surfaces, it doesn't bridge separate platforms"],
    ],
    { colWidths: [40, CONTENT_WIDTH - 40] }
  );

  // ━━ Tools and Technology Used ━━
  addHeading("Tools and Technology Used", 1);

  addTable(
    ["Layer", "Technology"],
    [
      ["Frontend framework", "React 18 + TypeScript"],
      ["Routing", "React Router v7"],
      ["Build tooling", "Vite 5"],
      ["Monorepo management", "npm workspaces"],
      ["Shared analysis engine", "@a11y-lab/core (TypeScript, zero dependencies)"],
      ["CLI tool", "Node.js + @a11y-lab/core (table, JSON, JUnit output)"],
      ["VS Code extension", "VS Code Extension API + @a11y-lab/core"],
      ["PDF export", "jsPDF"],
      ["Word export", "docx (npm)"],
      ["CORS proxy", "Cloudflare Workers"],
      ["Deployment", "GitHub Pages via GitHub Actions CI/CD"],
      ["Version control", "Git + GitHub"],
      ["Standards", "WCAG 2.1, WCAG 2.2, WAI-ARIA 1.2, SLDS"],
    ],
    { colWidths: [45, CONTENT_WIDTH - 45] }
  );

  addText("No backend database or external APIs for the core review — the entire analysis runs client-side in the browser, locally in the CLI, and in-process in the VS Code extension.", { style: "italic", color: COLORS.muted });

  // ━━ Demo Script ━━
  addHeading("Recorded Demo Script (under 5 minutes)", 1);

  addTable(
    ["Time", "What to show", "Talking point"],
    [
      ["0:00–0:30", "Landing page — scroll hero, features", "\"Lightning A11y Lab — a multi-surface accessibility review platform for Salesforce Lightning markup.\""],
      ["0:30–1:00", "Review console with Issues sample, WCAG AA/2.2", "\"Paste LWC or Aura template, choose WCAG target, hit Run Review.\""],
      ["1:00–2:00", "Results: scores, severity chips, finding cards", "\"34 checks: headings, labels, ARIA roles, contrast, landmarks, color-alone, modal focus — mapped to WCAG criteria with fix steps.\""],
      ["2:00–2:30", "Filter: category tabs, severity, search", "\"Filter by category, severity, or keyword for sprint focus.\""],
      ["2:30–3:00", "Export JSON / Word / PDF", "\"Structured exports for Jira tickets, release notes, audit evidence — all client-side.\""],
      ["3:00–3:20", "Clean sample → success banner, 100 scores", "\"Clean markup passes with no critical, major, or minor findings.\""],
      ["3:20–3:40", "Live URL fetch via proxy", "\"Fetch live pages through our Cloudflare Worker proxy and analyze directly.\""],
      ["3:40–4:00", "Resources page (6 sections, search)", "\"36 curated links: WCAG, SLDS, browser tools, learning paths.\""],
      ["4:00–4:20", "CLI tool terminal output", "\"Same 34 checks as CLI — scan files, CI integration with JUnit, severity-based build gates.\""],
      ["4:20–4:40", "VS Code extension diagnostics", "\"VS Code extension: inline diagnostics, status bar, review-on-save.\""],
      ["4:40–5:00", "Wrap up, toggle theme", "\"Three surfaces, one engine, zero data leaving your machine.\""],
    ],
    { colWidths: [20, 50, CONTENT_WIDTH - 70] }
  );

  // ━━ Business Impact ━━
  addHeading("Business Impact", 1);
  addText("Real ROI, measurable time saved, quality improvement, or client value delivered", { style: "italic", color: COLORS.muted, size: 9 });
  y += 3;

  addHeading("Time Saved per Project", 3);
  addTable(
    ["Activity", "Traditional", "With A11y Lab", "Savings"],
    [
      ["Manual a11y review of one LWC component", "45–60 min", "2–3 min", "~95%"],
      ["Generating audit evidence", "30 min", "30 sec (one-click export)", "~97%"],
      ["Remediating missed defect post-deploy", "4–8 hours", "Prevented at markup stage", "Avoided"],
      ["CI pipeline a11y gate", "Not feasible manually", "1 CLI command + JUnit", "New"],
      ["Training new developer on WCAG", "2–3 days", "Self-service via findings", "60–70%"],
    ],
    { colWidths: [45, 35, 40, CONTENT_WIDTH - 120] }
  );

  addHeading("Quality Improvement", 3);
  addBullet("34 automated checks covering the patterns that cause the most audit failures in Salesforce projects");
  addBullet("Zero false negatives on covered patterns — consistent detection regardless of reviewer experience");
  addBullet("Uniform severity classification (critical, major, minor, info) eliminates subjective variation");
  addBullet("Three delivery surfaces create multiple catch points across the development lifecycle");

  addHeading("ROI Calculation (per engagement)", 3);
  addTable(
    ["Metric", "Conservative Estimate"],
    [
      ["Components reviewed per sprint", "10–15"],
      ["Time saved per component", "40 min"],
      ["Sprint time saved", "7–10 hours"],
      ["Hourly delivery cost", "$150–$250"],
      ["Sprint cost savings", "$1,050–$2,500"],
      ["Sprints per engagement (avg)", "12–20"],
      ["Engagement cost savings", "$12,600–$50,000"],
      ["Post-deploy defect avoidance (per incident)", "$2,000–$8,000"],
    ],
    { colWidths: [CONTENT_WIDTH * 0.55, CONTENT_WIDTH * 0.45] }
  );

  // ━━ Feasibility & Scalability ━━
  addHeading("Feasibility & Scalability", 1);

  addHeading("Production Readiness", 3);
  addTable(
    ["Indicator", "Status"],
    [
      ["TypeScript strict mode", "Enabled — zero type errors, no any types"],
      ["Production build", "Passes (tsc --noEmit && vite build) — under 3 seconds"],
      ["Browser support", "All modern browsers (Chrome, Firefox, Safari, Edge)"],
      ["Deployment", "Live on GitHub Pages with CI/CD — every push auto-deploys"],
      ["Performance", "Full analysis runs in <100ms for typical component markup"],
      ["Security", "No data leaves the browser — zero server dependency"],
      ["Multi-surface", "Web app, CLI tool, and VS Code extension share one core engine"],
    ],
    { colWidths: [45, CONTENT_WIDTH - 45] }
  );

  addHeading("Adoption Barriers: Effectively None", 3);
  addTable(
    ["Concern", "How it's addressed"],
    [
      ["Installation", "Web app: none (it's a URL). CLI: npx a11y-review. VS Code: install .vsix"],
      ["Account / license", "No account, no API key, no cost"],
      ["Data sensitivity", "Source code stays on the user's machine — no uploads, no telemetry"],
      ["Learning curve", "Paste markup and click \"Run Review\" — findings are self-explanatory"],
      ["Team onboarding", "Share the URL. CLI and VS Code have zero-config defaults"],
    ],
    { colWidths: [38, CONTENT_WIDTH - 38] }
  );

  addHeading("Growth Path", 3);
  addTable(
    ["Current (Delivered)", "Near-term (1–2 sprints)", "Future"],
    [
      ["34 static checks", "Add 10–15 more checks", "LLM-powered deep review"],
      ["Browser-based analysis", "Salesforce DX plugin integration", "Org-level scanning"],
      ["CLI tool for CI pipelines", "Jira/ServiceNow integration", "Trend dashboards"],
      ["VS Code extension", "Auto-fix code actions", "IntelliJ/JetBrains extension"],
      ["6 export formats total", "GitHub PR comment integration", "Compliance reporting portal"],
      ["Cloudflare Worker proxy", "Custom proxy deployment docs", "Self-hosted proxy image"],
    ],
    { colWidths: [CONTENT_WIDTH / 3, CONTENT_WIDTH / 3, CONTENT_WIDTH / 3] }
  );

  // ━━ AI Depth & Creativity ━━
  addHeading("AI Depth & Creativity", 1);

  addHeading("How AI Was Used (Beyond Basic Code Generation)", 3);
  addTable(
    ["Technique", "What we did", "Why it's noteworthy"],
    [
      ["Specification-to-code translation", "Fed a QA accessibility checklist PDF to AI to identify gaps and implement 6 new rules", "AI cross-referenced checklist against codebase, identified 12 gaps, we selected 6 by feasibility"],
      ["Multi-file atomic operations", "Each new check required changes across 3 files — AI made all in one pass", "Eliminated integration drift — guide text always matches analyzer behavior"],
      ["Monorepo extraction", "AI extracted core engine into shared package consumed by 3 surfaces", "A full-sprint refactor completed in one AI-assisted session"],
      ["Multi-surface delivery", "AI built CLI tool and VS Code extension from shared core", "Three deployable artifacts from one prompt chain, all type-safe and build-verified"],
      ["Domain-expert remediation", "AI generated fix steps referencing Salesforce attributes, SLDS classes, and W3C docs", "Guides read like an a11y consultant who knows Lightning components"],
      ["Infrastructure automation", "AI created Cloudflare Worker proxy, GitHub Actions CI/CD, and SPA fallback", "Full deployment pipeline authored entirely through AI"],
      ["Continuous verification", "Every AI change validated through tsc, vite build, and lint in the same workflow", "Zero manual compile-fix cycles"],
      ["Content originality", "Explicit prompt: \"rewrite with original text — no duplicated phrasing from the web\"", "Avoids the AI pitfall of regurgitating generic marketing language"],
    ],
    { colWidths: [35, 60, CONTENT_WIDTH - 95] }
  );

  addHeading("Prompting Strategy", 3);
  addText("Our approach was high-context, task-specific prompting rather than vague requests:");
  y += 2;
  addTable(
    ["Weak prompt (avoided)", "Strong prompt (used)"],
    [
      ["\"Add more accessibility checks\"", "\"Using this attached PDF checklist, cross-reference against existing checks, identify uncovered items, and implement the 6 highest-value checks that static analysis can detect\""],
      ["\"Fix the CSS\"", "\"The top-bar, page-toolbar, and page-tagline should stay pinned when the body uses document scroll with body[data-app-view='scroll']\""],
      ["\"Make a CLI tool\"", "\"Extract the core analyzer into packages/core, then build a CLI in packages/cli — support file/directory scanning, table/JSON/JUnit output, and --fail-on severity flag\""],
    ],
    { colWidths: [CONTENT_WIDTH * 0.3, CONTENT_WIDTH * 0.7] }
  );

  addHeading("What Makes Our AI Usage Original", 3);
  addNumberedItem(1, "AI building a tool that checks code quality — meta-level creativity in using AI to build an automated checker that helps humans write better code");
  addNumberedItem(2, "PDF-to-feature-gap analysis — AI analyzed a QA checklist against existing code to surface specific gaps, a reusable pattern for operationalizing standards documents");
  addNumberedItem(3, "Self-documenting architecture — AI generated not just checks but the educational layer (importance, fix steps, references) that makes findings actionable");
  addNumberedItem(4, "Monorepo-from-monolith in one session — AI extracted shared core and built two new delivery surfaces, handling module system conflicts and cross-package imports");
  addNumberedItem(5, "Zero-infrastructure AI integration — AI used as development accelerator, keeping shipped product dependency-free and client-safe (no API calls, no data leaving browser)");
  addNumberedItem(6, "Full delivery pipeline — AI authored not just application code but GitHub Actions CI/CD, Cloudflare Worker proxy, SPA routing fallback, and environment variable management");

  // ── Page numbers & footer ──
  addPageNumbers();

  const { writeFileSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  const outPath = resolve(process.cwd(), "SUBMISSION-CONTENT.pdf");
  writeFileSync(outPath, Buffer.from(doc.output("arraybuffer")));
  console.log(`✅ PDF written → ${outPath}`);
}

generate();
