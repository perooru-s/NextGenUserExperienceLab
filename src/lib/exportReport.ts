import {
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { jsPDF } from "jspdf";
import type { ReviewResult } from "../types";

const APP_DISPLAY_NAME = "Lightning A11y Lab";
const EXPORT_FILE_PREFIX = "lightning-a11y-lab-review";

function fileStamp(iso: string): string {
  return iso.slice(0, 19).replace(/T/, "_").replace(/:/g, "-");
}

function triggerDownload(blob: Blob, filename: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Microsoft Word .docx */
export async function exportReviewAsDocx(result: ReviewResult, sourceCode: string): Promise<void> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: APP_DISPLAY_NAME,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      text: `Generated: ${new Date(result.meta.analyzedAt).toLocaleString()}`,
    }),
    new Paragraph({
      text: `WCAG target: ${result.meta.wcagVersion} ${result.meta.wcagTarget}`,
    }),
    new Paragraph({
      text: `Summary: ${result.summary.critical} critical · ${result.summary.major} major · ${result.summary.minor} minor · ${result.summary.info} info · ${result.meta.lineCount} lines`,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Full scan — all findings (not limited by UI filter).",
          italics: true,
        }),
      ],
    }),
    new Paragraph({ text: "" })
  );

  result.findings.forEach((f, i) => {
    children.push(
      new Paragraph({
        text: `${i + 1}. ${f.title}`,
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: `Severity: ${f.severity} · Category: ${f.category}${f.lineHint != null ? ` · ~line ${f.lineHint}` : ""}`,
      })
    );
    if (f.wcag) {
      children.push(
        new Paragraph({
          text: `WCAG: ${f.wcag.criterion} (${f.wcag.scope}+)`,
        })
      );
    }
    children.push(new Paragraph({ text: f.detail }));
    if (f.importance) {
      children.push(
        new Paragraph({ text: "Why this matters", heading: HeadingLevel.HEADING_3 }),
        new Paragraph({ text: f.importance })
      );
    }
    if (f.fixSteps?.length) {
      children.push(new Paragraph({ text: "How to understand and fix", heading: HeadingLevel.HEADING_3 }));
      f.fixSteps.forEach((step) =>
        children.push(
          new Paragraph({
            text: step,
            bullet: { level: 0 },
          })
        )
      );
    }
    if (f.remediation) {
      children.push(new Paragraph({ children: [new TextRun({ text: "Quick fix: ", bold: true }), new TextRun(f.remediation)] }));
    }
    if (f.snippet) {
      children.push(
        new Paragraph({ text: "Code snippet", heading: HeadingLevel.HEADING_3 }),
        new Paragraph({ text: f.snippet })
      );
    }
    if (f.resources?.length) {
      children.push(new Paragraph({ text: "Reference portals", heading: HeadingLevel.HEADING_3 }));
      f.resources.forEach((r) => {
        children.push(
          new Paragraph({
            children: [
              new ExternalHyperlink({
                children: [new TextRun({ text: r.label, style: "Hyperlink" })],
                link: r.href,
              }),
              new TextRun(` (${r.href})`),
            ],
          })
        );
      });
    }
    children.push(new Paragraph({ text: "" }));
  });

  children.push(
    new Paragraph({ text: "Source appendix", heading: HeadingLevel.HEADING_1 }),
    new Paragraph({
      text: sourceCode.length > 120_000 ? `${sourceCode.slice(0, 120_000)}\n\n[…truncated for document size]` : sourceCode,
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const stamp = fileStamp(result.meta.analyzedAt);
  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${EXPORT_FILE_PREFIX}-${stamp}.docx`);
}

/** PDF via jsPDF (multi-page text). */
export function exportReviewAsPdf(result: ReviewResult, sourceCode: string): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - 2 * margin;
  let y = margin;
  const gap = 8;
  const bodyFs = 10;
  const smallFs = 9;

  function newPage(): void {
    doc.addPage();
    y = margin;
  }

  function ensure(n: number): void {
    if (y + n > pageH - margin) newPage();
  }

  function addLines(text: string, fontSize: number, style: "normal" | "bold" | "italic" = "normal"): void {
    doc.setFont("helvetica", style === "bold" ? "bold" : style === "italic" ? "italic" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(20, 20, 20);
    const lines = doc.splitTextToSize(text, maxW);
    const lh = fontSize * 1.25;
    for (const line of lines) {
      ensure(lh);
      doc.text(line, margin, y);
      y += lh;
    }
    y += gap / 2;
  }

  function addResourceLine(label: string, href: string): void {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(smallFs);
    doc.setTextColor(20, 20, 20);
    const chunk = `• ${label}: ${href}`;
    const lines = doc.splitTextToSize(chunk, maxW);
    const lh = smallFs * 1.25;
    let first = true;
    for (const line of lines) {
      ensure(lh);
      if (first) {
        doc.setTextColor(1, 118, 211);
        doc.textWithLink(line, margin, y, { url: href });
        first = false;
      } else {
        doc.setTextColor(60, 60, 60);
        doc.text(line, margin, y);
      }
      y += lh;
    }
    doc.setTextColor(20, 20, 20);
    y += 4;
  }

  addLines(APP_DISPLAY_NAME, 18, "bold");
  addLines(
    `Generated: ${new Date(result.meta.analyzedAt).toLocaleString()}\nWCAG target: ${result.meta.wcagVersion} ${result.meta.wcagTarget}\nSummary: ${result.summary.critical} critical · ${result.summary.major} major · ${result.summary.minor} minor · ${result.summary.info} info\nSource: ${result.meta.lineCount} lines\nFull scan — all findings.`,
    smallFs,
    "normal"
  );
  y += gap;

  result.findings.forEach((f, i) => {
    addLines(`${i + 1}. ${f.title}`, 12, "bold");
    addLines(
      `Severity: ${f.severity.toUpperCase()} · Category: ${f.category}${f.lineHint != null ? ` · ~line ${f.lineHint}` : ""}${f.wcag ? `\nWCAG: ${f.wcag.criterion} (${f.wcag.scope}+)` : ""}`,
      smallFs
    );
    addLines(f.detail, bodyFs);
    if (f.importance) {
      addLines("Why this matters", smallFs, "bold");
      addLines(f.importance, bodyFs);
    }
    if (f.fixSteps?.length) {
      addLines("How to understand and fix", smallFs, "bold");
      f.fixSteps.forEach((step, idx) => addLines(`${idx + 1}. ${step}`, bodyFs));
    }
    if (f.remediation) addLines(`Quick fix: ${f.remediation}`, bodyFs);
    if (f.snippet) {
      addLines("Code snippet:", smallFs, "bold");
      addLines(f.snippet, smallFs - 0.5);
    }
    if (f.resources?.length) {
      addLines("Reference portals:", smallFs, "bold");
      f.resources.forEach((r) => addResourceLine(r.label, r.href));
    }
    y += gap;
  });

  addLines("Source appendix", 14, "bold");
  const appendix =
    sourceCode.length > 25_000 ? `${sourceCode.slice(0, 25_000)}\n\n[…truncated for PDF size]` : sourceCode;
  addLines(appendix, 8);

  const stamp = fileStamp(result.meta.analyzedAt);
  doc.save(`${EXPORT_FILE_PREFIX}-${stamp}.pdf`);
}

export function exportReviewAsJson(result: ReviewResult): void {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
  triggerDownload(blob, `${EXPORT_FILE_PREFIX}-${fileStamp(result.meta.analyzedAt)}.json`);
}
