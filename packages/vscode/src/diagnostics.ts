import * as vscode from "vscode";
import {
  analyzeSalesforceUI,
  type Finding,
  type FindingSeverity,
  type WcagLevel,
  type WcagVersion,
} from "@a11y-lab/core";

const SEVERITY_MAP: Record<FindingSeverity, vscode.DiagnosticSeverity> = {
  critical: vscode.DiagnosticSeverity.Error,
  major: vscode.DiagnosticSeverity.Error,
  minor: vscode.DiagnosticSeverity.Warning,
  info: vscode.DiagnosticSeverity.Information,
};

function findingToRange(doc: vscode.TextDocument, f: Finding): vscode.Range {
  if (f.lineHint && f.lineHint > 0 && f.lineHint <= doc.lineCount) {
    const line = doc.lineAt(f.lineHint - 1);
    return line.range;
  }
  return new vscode.Range(0, 0, 0, 0);
}

function findingToDiagnostic(doc: vscode.TextDocument, f: Finding): vscode.Diagnostic {
  const range = findingToRange(doc, f);
  const diag = new vscode.Diagnostic(range, f.title, SEVERITY_MAP[f.severity]);
  diag.source = "A11y Lab";
  diag.code = f.wcag?.criterion ?? f.severity;

  const parts: string[] = [f.detail];
  if (f.remediation) parts.push(`Fix: ${f.remediation}`);
  if (f.importance) parts.push(`Why: ${f.importance}`);
  diag.message = parts.join("\n\n");

  return diag;
}

export function reviewDocument(
  doc: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
): { total: number; summary: { critical: number; major: number; minor: number; info: number } } {
  const config = vscode.workspace.getConfiguration("a11yLab");
  const wcagTarget = (config.get<string>("wcagLevel") ?? "AA") as WcagLevel;
  const wcagVersion = (config.get<string>("wcagVersion") ?? "2.2") as WcagVersion;

  const source = doc.getText();
  const result = analyzeSalesforceUI(source, { wcagTarget, wcagVersion });

  const diagnostics = result.findings.map((f) => findingToDiagnostic(doc, f));
  collection.set(doc.uri, diagnostics);

  return { total: result.findings.length, summary: result.summary };
}

export function isReviewableFile(doc: vscode.TextDocument): boolean {
  if (doc.languageId !== "html") return false;
  const path = doc.uri.fsPath.toLowerCase();
  return path.endsWith(".html") && (
    path.includes("/lwc/") ||
    path.includes("/aura/") ||
    path.includes("/force-app/") ||
    path.includes("\\lwc\\") ||
    path.includes("\\aura\\") ||
    path.includes("\\force-app\\")
  );
}

export function isHtmlFile(doc: vscode.TextDocument): boolean {
  return doc.languageId === "html" && doc.uri.fsPath.toLowerCase().endsWith(".html");
}
