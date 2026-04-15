/**
 * Business-style executive deck for Lightning A11y Lab.
 * Run: npm run ppt:overview
 * Output: public/lightning-a11y-lab-overview-deck.pptx
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pptxgen from "pptxgenjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "lightning-a11y-lab-overview-deck.pptx");

/** Brand-aligned palette (Lightning A11y Lab — red sunburst family) */
const BURGUNDY = "4F000B";
const WINE = "720026";
const ROSE = "CE4257";
const CORAL = "FF7F51";
const CREAM = "FAF5F3";
const PANEL = "FFFFFF";
const INK = "3D0A12";
const MUTED = "5C3A45";
const RULE = "E8D4CF";
const SLATE = "64748B";

const SLIDE_W = 10;
const SLIDE_H = 5.625;

function todayStamp() {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Bottom rule + brand strip + date (content slides) */
function addSlideFooter(slide, pres) {
  slide.addShape(pres.ShapeType.line, {
    x: 0.55,
    y: SLIDE_H - 0.48,
    w: SLIDE_W - 1.1,
    h: 0,
    line: { color: RULE, width: 1 },
  });
  slide.addText("LIGHTNING A11Y LAB", {
    x: 0.55,
    y: SLIDE_H - 0.4,
    w: 5.5,
    h: 0.28,
    fontSize: 8.5,
    color: SLATE,
    bold: true,
    charSpacing: 2,
  });
  slide.addText(todayStamp(), {
    x: SLIDE_W - 2.55,
    y: SLIDE_H - 0.4,
    w: 2,
    h: 0.28,
    fontSize: 8.5,
    color: SLATE,
    align: "right",
  });
}

/** Left brand spine + light canvas */
function addBusinessCanvas(slide, pres) {
  slide.background = { color: CREAM };
  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.11,
    h: "100%",
    fill: { color: WINE },
    line: { width: 0 },
  });
}

/**
 * @param {{ kicker: string; title: string; slide: import("pptxgenjs").Slide; pres: import("pptxgenjs").default }} o
 */
function addSlideHeader(o) {
  const { slide, pres, kicker, title } = o;
  addBusinessCanvas(slide, pres);
  slide.addText(kicker.toUpperCase(), {
    x: 0.55,
    y: 0.38,
    w: 8.9,
    h: 0.26,
    fontSize: 9.5,
    bold: true,
    color: ROSE,
    charSpacing: 2,
  });
  slide.addText(title, {
    x: 0.55,
    y: 0.62,
    w: 8.9,
    h: 0.75,
    fontSize: 28,
    bold: true,
    color: INK,
    fontFace: "Calibri",
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0.55,
    y: 1.38,
    w: 1.65,
    h: 0.045,
    fill: { color: CORAL },
    line: { width: 0 },
  });
}

function addBullets(slide, lines, y = 1.55) {
  slide.addText(
    lines.map((text) => ({
      text,
      options: { bullet: true, breakLine: true },
    })),
    {
      x: 0.55,
      y,
      w: 8.95,
      h: SLIDE_H - y - 0.58,
      fontSize: 14.5,
      color: MUTED,
      valign: "top",
      lineSpacingMultiple: 1.22,
      fontFace: "Calibri",
    }
  );
}

/** Highlight strip (single key message) */
function addKeyTakeaway(slide, pres, text) {
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.55,
    y: SLIDE_H - 1.12,
    w: 8.95,
    h: 0.58,
    fill: { color: PANEL },
    line: { color: RULE, width: 1 },
    rectRadius: 0.06,
  });
  slide.addText("KEY TAKEAWAY", {
    x: 0.75,
    y: SLIDE_H - 1.02,
    w: 1.6,
    h: 0.2,
    fontSize: 7.5,
    bold: true,
    color: ROSE,
    charSpacing: 1.5,
  });
  slide.addText(text, {
    x: 0.75,
    y: SLIDE_H - 0.82,
    w: 8.55,
    h: 0.38,
    fontSize: 12.5,
    bold: true,
    color: INK,
    fontFace: "Calibri",
  });
}

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Lightning A11y Lab — Executive overview";
  pres.subject = "Accessibility assurance for Salesforce Lightning delivery";
  pres.author = "Lightning A11y Lab";
  pres.company = "Lightning A11y Lab";

  // —— 1. Title (hero) ——
  {
    const s = pres.addSlide();
    s.background = { color: BURGUNDY };
    s.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 2.85,
      w: "100%",
      h: 2.8,
      fill: { color: WINE, transparency: 25 },
      line: { width: 0 },
    });
    s.addShape(pres.ShapeType.rect, {
      x: 0.65,
      y: 1.55,
      w: 2.35,
      h: 0.06,
      fill: { color: CORAL },
      line: { width: 0 },
    });
    s.addText("Lightning A11y Lab", {
      x: 0.65,
      y: 0.85,
      w: 8.7,
      h: 0.85,
      fontSize: 46,
      bold: true,
      color: "FFFFFF",
      fontFace: "Calibri Light",
    });
    s.addText("Accessibility assurance for Salesforce Lightning teams", {
      x: 0.65,
      y: 1.78,
      w: 8.5,
      h: 0.55,
      fontSize: 20,
      color: "F1E0E4",
      fontFace: "Calibri",
    });
    s.addText("Executive briefing · WCAG-aligned static analysis · Browser-first privacy", {
      x: 0.65,
      y: 2.42,
      w: 8.5,
      h: 0.4,
      fontSize: 12.5,
      color: "C9A8B0",
    });
    s.addText("INTERNAL USE", {
      x: 0.65,
      y: SLIDE_H - 0.55,
      w: 2.5,
      h: 0.3,
      fontSize: 9,
      bold: true,
      color: "FFFFFF",
      transparency: 35,
      charSpacing: 3,
    });
    s.addText(todayStamp(), {
      x: SLIDE_W - 2.4,
      y: SLIDE_H - 0.55,
      w: 1.75,
      h: 0.3,
      fontSize: 11,
      color: "E8D4CF",
      align: "right",
    });
    s.addNotes(
      "Open with delivery risk: late accessibility defects cost rework and release delay. Position the lab as an upstream control, not a replacement for formal audit."
    );
  }

  // —— 2. Agenda ——
  {
    const s = pres.addSlide();
    addSlideHeader({
      slide: s,
      pres,
      kicker: "At a glance",
      title: "Agenda",
    });
    const rows = [
      [
        { text: "Section", options: { bold: true, fill: { color: WINE }, color: "FFFFFF", fontSize: 11 } },
        { text: "What stakeholders get", options: { bold: true, fill: { color: WINE }, color: "FFFFFF", fontSize: 11 } },
      ],
      [
        { text: "1. Context", options: { bold: true, color: INK, fontSize: 11.5 } },
        {
          text: "Why accessibility belongs in the delivery cadence—and what happens when it is late.",
          options: { color: MUTED, fontSize: 11.5 },
        },
      ],
      [
        { text: "2. Solution", options: { bold: true, color: INK, fontSize: 11.5 } },
        {
          text: "What the lab is, how teams use it in minutes, and how outputs feed governance.",
          options: { color: MUTED, fontSize: 11.5 },
        },
      ],
      [
        { text: "3. Value & ROI", options: { bold: true, color: INK, fontSize: 11.5 } },
        {
          text: "Faster feedback, clearer handoffs, and hours saved per story before UAT.",
          options: { color: MUTED, fontSize: 11.5 },
        },
      ],
      [
        { text: "4. Trust", options: { bold: true, color: INK, fontSize: 11.5 } },
        {
          text: "Modern web stack, client-side exports, and WCAG-oriented rules your architects can stand behind.",
          options: { color: MUTED, fontSize: 11.5 },
        },
      ],
      [
        { text: "5. Next steps", options: { bold: true, color: INK, fontSize: 11.5 } },
        {
          text: "How to pilot with a squad and where to find curated standards and tooling links.",
          options: { color: MUTED, fontSize: 11.5 },
        },
      ],
    ];
    s.addTable(rows, {
      x: 0.55,
      y: 1.52,
      w: 8.95,
      h: 3.35,
      colW: [2.35, 6.6],
      border: { type: "solid", color: RULE, pt: 0.75 },
      fontSize: 11,
      valign: "middle",
      margin: [6, 8, 6, 8],
    });
    addSlideFooter(s, pres);
    s.addNotes("Use this table to set expectations: five blocks, ~10 minutes with discussion.");
  }

  // —— 3. Business context ——
  {
    const s = pres.addSlide();
    addSlideHeader({
      slide: s,
      pres,
      kicker: "Why leaders care",
      title: "Accessibility is a delivery risk—not only a compliance checkbox",
    });
    addBullets(s, [
      "Digital accessibility affects reach, brand trust, and legal exposure when experiences exclude users.",
      "Defects discovered after UAT or in production force expensive rework, calendar slips, and audit findings.",
      "Shifting left with a repeatable first pass reduces surprise work and aligns engineering, QA, and governance on WCAG language.",
    ]);
    addKeyTakeaway(
      s,
      pres,
      "Treat accessibility like quality: instrument the pipeline early; reserve specialists for judgment and sign-off."
    );
    addSlideFooter(s, pres);
    s.addNotes("Tie to your org: name release train, UAT gate, or accessibility council if applicable.");
  }

  // —— 4. Solution overview ——
  {
    const s = pres.addSlide();
    addSlideHeader({
      slide: s,
      pres,
      kicker: "Product overview",
      title: "A browser lab built for Lightning markup",
    });
    s.addText(
      [
        {
          text: "Paste LWC, Aura, or mixed Lightning markup; choose WCAG level (A / AA / AAA) and version (2.1 or 2.2); run static analysis in the browser.",
          options: { breakLine: true },
        },
        {
          text: "Receive structured findings with severity, context, and remediation hints—without sending source to a backend by default.",
          options: { breakLine: true, paraSpaceBefore: 10 },
        },
        {
          text: "Export JSON, Word, or PDF for tickets, release notes, and evidence packs; pair with the Learn & Resources hub for standards links.",
          options: { breakLine: true, paraSpaceBefore: 10 },
        },
      ],
      {
        x: 0.55,
        y: 1.52,
        w: 8.95,
        h: 2.55,
        fontSize: 14.5,
        color: MUTED,
        valign: "top",
        lineSpacingMultiple: 1.2,
        fontFace: "Calibri",
      }
    );
    addKeyTakeaway(s, pres, "One shared console for developers and QA before formal accessibility review.");
    addSlideFooter(s, pres);
    s.addNotes("Demo path: paste sample → run review → export → attach to Jira/Azure DevOps.");
  }

  // —— 5. Operating model (how it works) ——
  {
    const s = pres.addSlide();
    addSlideHeader({
      slide: s,
      pres,
      kicker: "Workflow",
      title: "How teams fold the lab into the cadence",
    });
    addBullets(s, [
      "During development: quick scan on markup changes before pull request or feature review.",
      "Before hardening: batch larger templates and shared components for consistent WCAG language.",
      "With QA: export structured results to work items; pair with manual keyboard and screen-reader spot checks.",
    ]);
    addSlideFooter(s, pres);
    s.addNotes("Emphasize minutes, not days—mechanical screening frees specialists for edge cases.");
  }

  // —— 6. Value & ROI ——
  {
    const s = pres.addSlide();
    addSlideHeader({
      slide: s,
      pres,
      kicker: "Outcomes",
      title: "Velocity, clarity, and hours back to the team",
    });
    addBullets(s, [
      "Faster feedback: immediate findings versus waiting for audit slots or long manual checklists.",
      "Clearer handoffs: explicit WCAG targets every run; exports map cleanly to tickets and email.",
      "Privacy-friendly default: analysis runs locally—important for client or pre-release markup.",
      "Mechanical screening across large snippets cuts rework cycles—often saving hours per story when issues are caught early.",
    ]);
    addKeyTakeaway(s, pres, "Invest minutes upstream to avoid multi-day firefights downstream.");
    addSlideFooter(s, pres);
    s.addNotes("Optional: quantify with your average story cost or UAT defect rate if you have data.");
  }

  // —— 7. Technology & trust ——
  {
    const s = pres.addSlide();
    addSlideHeader({
      slide: s,
      pres,
      kicker: "Architecture credibility",
      title: "Modern stack · Client-side exports · WCAG-oriented engine",
    });
    addBullets(s, [
      "React & TypeScript UI; Vite builds; React Router for marketing, review, and Learn & Resources.",
      "jsPDF and docx generate PDF and Word on the client—suitable for attachment to governance workflows.",
      "Static engine: WCAG-oriented rules, contrast heuristics where parseable, SLDS-friendly patterns—complements assistive-tech testing.",
    ]);
    addSlideFooter(s, pres);
    s.addNotes("Invite architecture or security to nod on browser-local processing if that is a buying criterion.");
  }

  // —— 8. Closing ——
  {
    const s = pres.addSlide();
    s.background = { color: BURGUNDY };
    s.addShape(pres.ShapeType.rect, {
      x: 0.55,
      y: 1.05,
      w: 3.1,
      h: 0.055,
      fill: { color: CORAL },
      line: { width: 0 },
    });
    s.addText("Recommended next steps", {
      x: 0.55,
      y: 0.55,
      w: 8.9,
      h: 0.45,
      fontSize: 14,
      bold: true,
      color: "E8B4BC",
      charSpacing: 2,
    });
    s.addText("Move from pilot to practice", {
      x: 0.55,
      y: 1.22,
      w: 8.9,
      h: 0.65,
      fontSize: 34,
      bold: true,
      color: "FFFFFF",
      fontFace: "Calibri Light",
    });
    s.addText(
      [
        {
          text: "Run npm run dev, open Review console, and try a real component from your backlog.",
          options: { bullet: true, breakLine: true, color: "F5E6EA", fontSize: 15 },
        },
        {
          text: "Point squads to Learn & Resources for WCAG, SLDS, Trailhead, and browser tooling.",
          options: { bullet: true, breakLine: true, color: "F5E6EA", fontSize: 15 },
        },
        {
          text: "Regenerate this deck any time: npm run ppt:overview",
          options: { bullet: true, breakLine: true, color: "D4B8C0", fontSize: 13 },
        },
      ],
      {
        x: 0.55,
        y: 2.15,
        w: 8.9,
        h: 2.35,
        fontFace: "Calibri",
      }
    );
    s.addText("Thank you", {
      x: 0.55,
      y: SLIDE_H - 0.95,
      w: 4,
      h: 0.45,
      fontSize: 22,
      bold: true,
      color: "FFFFFF",
    });
    s.addText("LIGHTNING A11Y LAB", {
      x: SLIDE_W - 3.35,
      y: SLIDE_H - 0.88,
      w: 2.8,
      h: 0.35,
      fontSize: 10,
      bold: true,
      color: "C9A8B0",
      align: "right",
      charSpacing: 2,
    });
    s.addNotes("Close with one ask: pick a pilot squad and a success metric (e.g., fewer a11y defects in UAT).");
  }

  await pres.writeFile({ fileName: OUT });
  console.log(`Wrote ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
