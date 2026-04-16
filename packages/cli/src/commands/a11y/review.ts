import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, relative, extname } from "node:path";
import { parseArgs } from "node:util";
import {
  analyzeSalesforceUI,
  type FindingSeverity,
  type ReviewResult,
  type WcagLevel,
  type WcagVersion,
} from "@a11y-lab/core";

const SEVERITY_ORDER: FindingSeverity[] = ["critical", "major", "minor", "info"];

const SEVERITY_COLORS: Record<FindingSeverity, string> = {
  critical: "\x1b[31m",
  major: "\x1b[33m",
  minor: "\x1b[36m",
  info: "\x1b[90m",
};
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

interface FileResult {
  file: string;
  result: ReviewResult;
}

function collectHtmlFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      files.push(...collectHtmlFiles(full));
    } else if (extname(entry.name).toLowerCase() === ".html") {
      files.push(full);
    }
  }
  return files;
}

function formatTable(results: FileResult[], basePath: string): string {
  const lines: string[] = [];
  let totalCritical = 0;
  let totalMajor = 0;
  let totalMinor = 0;
  let totalInfo = 0;

  for (const { file, result } of results) {
    const relPath = relative(basePath, file);
    const { summary } = result;
    totalCritical += summary.critical;
    totalMajor += summary.major;
    totalMinor += summary.minor;
    totalInfo += summary.info;

    if (result.findings.length === 0) continue;

    lines.push("");
    lines.push(`${BOLD}${relPath}${RESET}`);
    lines.push(`${DIM}${"─".repeat(Math.min(relPath.length + 10, 80))}${RESET}`);

    for (const f of result.findings) {
      const color = SEVERITY_COLORS[f.severity];
      const line = f.lineHint ? `:${f.lineHint}` : "";
      const wcag = f.wcag ? ` [${f.wcag.criterion}]` : "";
      lines.push(`  ${color}${f.severity.toUpperCase().padEnd(9)}${RESET} ${f.title}${DIM}${wcag}${RESET}${DIM} ${relPath}${line}${RESET}`);
    }
  }

  lines.push("");
  lines.push(`${BOLD}Summary${RESET}`);
  lines.push(`  Files scanned:  ${results.length}`);
  lines.push(`  ${SEVERITY_COLORS.critical}Critical: ${totalCritical}${RESET}`);
  lines.push(`  ${SEVERITY_COLORS.major}Major:    ${totalMajor}${RESET}`);
  lines.push(`  ${SEVERITY_COLORS.minor}Minor:    ${totalMinor}${RESET}`);
  lines.push(`  ${SEVERITY_COLORS.info}Info:     ${totalInfo}${RESET}`);

  return lines.join("\n");
}

function formatJson(results: FileResult[], basePath: string): string {
  const output = results.map(({ file, result }) => ({
    file: relative(basePath, file),
    ...result,
  }));
  return JSON.stringify(output, null, 2);
}

function formatJunit(results: FileResult[], basePath: string): string {
  let failures = 0;
  let tests = 0;
  const cases: string[] = [];

  for (const { file, result } of results) {
    const relPath = relative(basePath, file);
    for (const f of result.findings) {
      tests++;
      if (f.severity === "critical" || f.severity === "major") failures++;
      const escaped = f.detail.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      const isFailure = f.severity === "critical" || f.severity === "major";
      cases.push(
        `    <testcase name="${f.title}" classname="${relPath}">${
          isFailure ? `\n      <failure message="${escaped}" type="${f.severity}" />` : ""
        }\n    </testcase>`
      );
    }
  }

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<testsuites tests="${tests}" failures="${failures}">`,
    `  <testsuite name="a11y-review" tests="${tests}" failures="${failures}">`,
    ...cases,
    `  </testsuite>`,
    `</testsuites>`,
  ].join("\n");
}

function shouldFail(results: FileResult[], failOn: FindingSeverity): boolean {
  const threshold = SEVERITY_ORDER.indexOf(failOn);
  for (const { result } of results) {
    for (const f of result.findings) {
      if (SEVERITY_ORDER.indexOf(f.severity) <= threshold) return true;
    }
  }
  return false;
}

function printHelp(): void {
  console.log(`
${BOLD}a11y-review${RESET} — Lightning A11y Lab CLI

${BOLD}USAGE${RESET}
  a11y-review [options]

${BOLD}OPTIONS${RESET}
  -p, --path <dir|file>   Path to scan (default: current directory)
  -l, --wcag-level <lvl>  WCAG level: A, AA, AAA (default: AA)
  -v, --wcag-version <v>  WCAG version: 2.1, 2.2 (default: 2.2)
  -f, --format <fmt>      Output: table, json, junit (default: table)
  --fail-on <severity>    Exit 1 if findings at this level or above:
                           critical, major, minor (default: major)
  -h, --help              Show this help

${BOLD}EXAMPLES${RESET}
  a11y-review --path force-app/main/default/lwc
  a11y-review --path src/aura --format json --fail-on critical
  a11y-review -p my-component.html -l AAA -v 2.1
`);
}

export function run(argv: string[] = process.argv.slice(2)): void {
  const { values } = parseArgs({
    args: argv,
    options: {
      path: { type: "string", short: "p", default: "." },
      "wcag-level": { type: "string", short: "l", default: "AA" },
      "wcag-version": { type: "string", short: "v", default: "2.2" },
      format: { type: "string", short: "f", default: "table" },
      "fail-on": { type: "string", default: "major" },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
  });

  if (values.help) {
    printHelp();
    process.exit(0);
  }

  const targetPath = resolve(values.path!);
  const wcagTarget = (values["wcag-level"] ?? "AA") as WcagLevel;
  const wcagVersion = (values["wcag-version"] ?? "2.2") as WcagVersion;
  const format = values.format ?? "table";
  const failOn = (values["fail-on"] ?? "major") as FindingSeverity;

  if (!["A", "AA", "AAA"].includes(wcagTarget)) {
    console.error(`Invalid --wcag-level: ${wcagTarget}. Use A, AA, or AAA.`);
    process.exit(2);
  }
  if (!["2.1", "2.2"].includes(wcagVersion)) {
    console.error(`Invalid --wcag-version: ${wcagVersion}. Use 2.1 or 2.2.`);
    process.exit(2);
  }
  if (!["table", "json", "junit"].includes(format)) {
    console.error(`Invalid --format: ${format}. Use table, json, or junit.`);
    process.exit(2);
  }

  let files: string[];
  try {
    const stat = statSync(targetPath);
    if (stat.isFile()) {
      files = [targetPath];
    } else {
      files = collectHtmlFiles(targetPath);
    }
  } catch {
    console.error(`Path not found: ${targetPath}`);
    process.exit(2);
  }

  if (files.length === 0) {
    console.error(`No .html files found in ${targetPath}`);
    process.exit(0);
  }

  const basePath = statSync(targetPath).isFile() ? resolve(targetPath, "..") : targetPath;

  const results: FileResult[] = files.map((file) => {
    const source = readFileSync(file, "utf-8");
    const result = analyzeSalesforceUI(source, { wcagTarget, wcagVersion });
    return { file, result };
  });

  switch (format) {
    case "json":
      console.log(formatJson(results, basePath));
      break;
    case "junit":
      console.log(formatJunit(results, basePath));
      break;
    default:
      console.log(formatTable(results, basePath));
      break;
  }

  if (shouldFail(results, failOn)) {
    process.exit(1);
  }
}
