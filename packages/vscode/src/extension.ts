import * as vscode from "vscode";
import { reviewDocument, isReviewableFile, isHtmlFile } from "./diagnostics.js";

let statusBarItem: vscode.StatusBarItem;

function updateStatusBar(total: number, summary: { critical: number; major: number; minor: number; info: number }): void {
  if (total === 0) {
    statusBarItem.text = "$(check) A11y: 0 issues";
    statusBarItem.backgroundColor = undefined;
  } else if (summary.critical > 0 || summary.major > 0) {
    statusBarItem.text = `$(alert) A11y: ${total} issue${total === 1 ? "" : "s"}`;
    statusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground");
  } else {
    statusBarItem.text = `$(info) A11y: ${total} issue${total === 1 ? "" : "s"}`;
    statusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
  }
  statusBarItem.show();
}

function reviewActiveEditor(collection: vscode.DiagnosticCollection): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor || !isHtmlFile(editor.document)) {
    statusBarItem.hide();
    return;
  }

  const { total, summary } = reviewDocument(editor.document, collection);
  updateStatusBar(total, summary);
}

export function activate(context: vscode.ExtensionContext): void {
  const collection = vscode.languages.createDiagnosticCollection("a11y-lab");
  context.subscriptions.push(collection);

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = "a11yLab.reviewCurrentFile";
  statusBarItem.tooltip = "Lightning A11y Lab — click to review";
  context.subscriptions.push(statusBarItem);

  context.subscriptions.push(
    vscode.commands.registerCommand("a11yLab.reviewCurrentFile", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("No active editor to review.");
        return;
      }
      if (!isHtmlFile(editor.document)) {
        vscode.window.showWarningMessage("A11y Lab reviews .html files. Open an HTML file first.");
        return;
      }
      const { total, summary } = reviewDocument(editor.document, collection);
      updateStatusBar(total, summary);
      const msg = total === 0
        ? "No accessibility issues found."
        : `Found ${total} issue${total === 1 ? "" : "s"}: ${summary.critical} critical, ${summary.major} major, ${summary.minor} minor, ${summary.info} info`;
      vscode.window.showInformationMessage(msg);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("a11yLab.reviewAllComponents", async () => {
      const files = await vscode.workspace.findFiles("**/{lwc,aura,force-app}/**/*.html", "**/node_modules/**");
      if (files.length === 0) {
        vscode.window.showWarningMessage("No LWC/Aura HTML files found in the workspace.");
        return;
      }

      let totalFindings = 0;
      let filesWithIssues = 0;

      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: "A11y Lab: Reviewing components...", cancellable: false },
        async (progress) => {
          for (let i = 0; i < files.length; i++) {
            progress.report({ increment: (100 / files.length), message: `${i + 1}/${files.length}` });
            const doc = await vscode.workspace.openTextDocument(files[i]);
            const { total } = reviewDocument(doc, collection);
            totalFindings += total;
            if (total > 0) filesWithIssues++;
          }
        }
      );

      vscode.window.showInformationMessage(
        `A11y Lab: Reviewed ${files.length} files — ${totalFindings} issue${totalFindings === 1 ? "" : "s"} in ${filesWithIssues} file${filesWithIssues === 1 ? "" : "s"}.`
      );
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      const config = vscode.workspace.getConfiguration("a11yLab");
      if (!config.get<boolean>("reviewOnSave", true)) return;
      if (!isHtmlFile(doc)) return;

      const { total, summary } = reviewDocument(doc, collection);
      if (vscode.window.activeTextEditor?.document === doc) {
        updateStatusBar(total, summary);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      if (isReviewableFile(doc)) {
        reviewDocument(doc, collection);
      }
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      reviewActiveEditor(collection);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => {
      collection.delete(doc.uri);
    })
  );

  reviewActiveEditor(collection);
}

export function deactivate(): void {
  statusBarItem?.dispose();
}
