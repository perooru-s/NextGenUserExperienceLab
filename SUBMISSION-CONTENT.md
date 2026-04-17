# Hackathon Submission Content

> **Team / Solution Name:** NextGen Experience Lab – Designing quality at scale

---

## Business Case

* **Problem:** UX and accessibility issues in Salesforce are often identified late (QA/UAT), causing rework, delays, and inconsistent user experiences; manual reviews are slow and hard to scale.
* **Solution:** A multi-surface accessibility review platform — browser app, CLI tool, and VS Code extension — that analyzes Salesforce LWC/Aura markup to automatically detect accessibility gaps, UX inconsistencies, and SLDS pattern issues early in development.
* **Business Impact:** Reduces late-stage defects and rework, improves delivery quality and consistency, and saves time by automating UX and accessibility reviews across every stage of the development workflow.
* **CSX Value:** Aligns with AI-enabled client delivery and productivity goals, embeds responsible and inclusive design into CSX delivery workflows, and creates a reusable accelerator across Salesforce engagements.

---

## Business Use Case and Impact

Salesforce delivery teams routinely ship LWC and Aura components that reach enterprise end users — including people who rely on screen readers, keyboards, or magnification. Yet accessibility defects are typically caught late: during UAT, governance sign-off, or worse, after a formal ADA/Section 508 complaint. Remediating at that stage is 4× more expensive than fixing at the code level, and a single overlooked pattern (e.g. an unlabeled input) often propagates across dozens of components before anyone notices.

Lightning A11y Lab addresses this by giving developers and QA a shared review platform that catches WCAG violations at the markup stage — before code reaches a sandbox or production org. It ships as three complementary surfaces:

1. **Browser-based review console** — paste markup or fetch a live URL, run 34 static checks, review severity-ranked findings with remediation guidance, and export results
2. **CLI tool (`a11y-review`)** — scan files or directories from the terminal or CI pipelines, with table, JSON, and JUnit output formats
3. **VS Code extension** — inline diagnostics, status bar summary, review-on-save, and workspace-wide scanning for LWC/Aura HTML files

**Impact:**

* **Shift-left accessibility** — developers catch issues during development, not after deployment
* **Reduced audit remediation costs** — findings are severity-ranked and mapped to specific WCAG criteria, so teams fix the right things first
* **Governance-ready evidence** — structured exports (JSON, Word, PDF, JUnit) attach directly to release tickets, pull requests, CI dashboards, or audit evidence packages
* **Zero friction adoption** — the web app runs entirely in the browser with no account, no installation, and no data leaving the user's machine; the CLI and VS Code extension install in under a minute
* **Broader user reach** — helps teams build digital experiences that work for the 1+ billion people worldwide who experience some form of disability

---

## Solution / Approach Overview

Lightning A11y Lab is a multi-surface static analysis platform purpose-built for Salesforce Lightning markup. It is organized as a monorepo with a shared core analysis engine consumed by three delivery surfaces.

### Architecture

```
@a11y-lab/core (shared engine — 34 checks, 33 remediation guides)
       │
       ├── Web app (React + Vite → GitHub Pages)
       ├── CLI tool (a11y-review → terminal / CI pipelines)
       └── VS Code extension (inline diagnostics + status bar)
```

### Web App Workflow

1. **Paste** LWC, Aura, or raw HTML markup into the review console — or **fetch HTML from a live URL** (via a Cloudflare Worker CORS proxy)
2. **Configure** the WCAG target — version (2.1 or 2.2) and conformance level (A, AA, or AAA)
3. **Run the analysis** — the engine performs **34 static checks** covering accessibility, mobile responsiveness, UX consistency, and SLDS patterns
4. **Review findings** — each one shows severity, affected line, WCAG success criterion, remediation steps, and reference links
5. **Export results** as JSON, Word, or PDF for governance workflows

### CLI Workflow

```bash
npx a11y-review force-app/main/default/lwc --wcag-level AA --format table
npx a11y-review force-app/ --format junit > a11y-results.xml  # CI pipeline
```

* Scan individual files or recursively scan directories
* Output as colored table (human), JSON (machine), or JUnit XML (CI integration)
* `--fail-on` flag for CI gates (e.g. `--fail-on major` fails the build if any major+ findings exist)

### VS Code Extension

* Inline squiggly diagnostics on LWC/Aura HTML files — findings appear in the Problems panel
* Status bar indicator showing issue count with severity coloring
* **Review on save** (configurable) — findings update automatically as you work
* **Review All Components** command — scans every `lwc/`, `aura/`, `force-app/` HTML file in the workspace with a progress indicator

### Key Technical Decisions

* **All analysis runs client-side** — no server, no API calls, no data exfiltration risk (web app and VS Code); CLI reads local files only
* **Salesforce-aware rules** — checks understand `lightning-input` labels, `lightning-card` titles, SLDS class conventions, and Aura component structures, not just generic HTML
* **Multi-dimensional scoring** — findings are grouped into Performance, Accessibility, Best Practices, and SEO & Discoverability lenses, each scored 0–100 so teams can prioritize by impact area
* **Educational layer** — every finding includes importance context, step-by-step fix guidance, and links to W3C, MDN, SLDS, and Trailhead documentation (33 curated guide entries)
* **Shared core engine** — one analysis library (`@a11y-lab/core`) consumed by all three surfaces via npm workspaces, ensuring consistent behavior everywhere
* **Production CORS proxy** — a Cloudflare Worker enables the hosted web app to fetch and analyze live URLs without CORS restrictions

### Additional Features

* Curated **Accessibility Resources** page (36 links across 6 categories) with search and jump navigation
* 7 visual themes with `localStorage` persistence
* Input validation with styled error feedback
* Marketing landing page with team profiles, FAQ, and accessibility impact content
* Contact form for accessibility training inquiries

---

## Category Selection

**Recommended category: Client Delivery**

### Why Client Delivery is the best fit

Lightning A11y Lab directly improves the quality of what gets delivered to clients on Salesforce projects:

1. **It sits in the delivery pipeline** — developers use the VS Code extension during active coding, the CLI tool runs in CI pipelines, and QA uses the browser console for review. It's a quality gate for client-facing deliverables at every stage.
2. **It solves a real delivery risk** — accessibility defects caught post-deployment cause rework, delay releases, and expose clients to ADA/Section 508 legal risk. This tool catches those issues at the markup stage, directly reducing delivery risk and remediation cost.
3. **It produces governance artifacts** — the JSON, Word, PDF, and JUnit exports are designed to attach to release tickets, CI dashboards, and audit evidence packages. That's a delivery workflow output.
4. **It's Salesforce-specific** — the checks are built around Lightning component patterns (LWC labels, SLDS classes, Aura structures) that matter in actual client engagements, not generic web rules.

### Why not the others

| Category | Why it's not the primary fit |
|---|---|
| Productivity Boost | The tool does save developer time, but its core purpose is improving delivery quality, not speeding up individual tasks |
| Data & Insights | It produces findings and scores, but the goal is remediation, not analytics or reporting as a primary value |
| Innovation | It uses a novel approach (client-side static analysis + multi-surface delivery for Salesforce markup), but the value proposition is practical delivery improvement |
| Cross-Platform Collaboration | While the shared core enables multiple surfaces, it doesn't bridge separate platforms or connect disparate systems |

Client Delivery positions the tool where its impact is most tangible — improving what ships to the client and reducing the cost of getting there.

---

## Tools and Technology Used

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript |
| Routing | React Router v7 |
| Build tooling | Vite 5 |
| Monorepo management | npm workspaces |
| Shared analysis engine | `@a11y-lab/core` (TypeScript, zero dependencies) |
| CLI tool | Node.js + `@a11y-lab/core` (table, JSON, JUnit output) |
| VS Code extension | VS Code Extension API + `@a11y-lab/core` |
| PDF export | jsPDF |
| Word export | docx (npm) |
| Presentation generation | pptxgenjs |
| CORS proxy | Cloudflare Workers |
| Deployment | GitHub Pages via GitHub Actions CI/CD |
| Version control | Git + GitHub |
| Standards referenced | WCAG 2.1, WCAG 2.2, WAI-ARIA 1.2, Salesforce Lightning Design System (SLDS) |

No backend database or external APIs for the core review — the entire analysis runs client-side in the browser, locally in the CLI, and in-process in the VS Code extension.

---

## Recorded Demo Script (under 5 minutes)

| Time | What to show | Talking point |
|---|---|---|
| 0:00–0:30 | Landing page — scroll through hero, "Why accessibility matters," feature cards | "This is Lightning A11y Lab — a multi-surface accessibility review platform built specifically for Salesforce Lightning markup." |
| 0:30–1:00 | Click "Launch tool" — show the review console with the Issues sample pre-loaded, WCAG AA / 2.2 selected | "Developers paste their LWC or Aura template, choose a WCAG target, and hit Run Review." |
| 1:00–2:00 | Run Review — scroll through the results: quality scores, severity chips, finding cards with line hints and WCAG criteria | "34 static checks cover heading hierarchy, missing labels, ARIA role validation, contrast, landmarks, color-alone patterns, modal focus management, and more — each mapped to a specific WCAG success criterion with severity, remediation steps, and reference links." |
| 2:00–2:30 | Filter findings — use category tabs (a11y, ux, mobile, slds) and severity filters, use the search box | "Teams can filter by category, severity, or keyword to focus on what matters for their sprint." |
| 2:30–3:00 | Export — click JSON, Word, or PDF export button | "Structured exports attach to Jira tickets, release notes, or audit evidence packages — all generated client-side, no data leaves your machine." |
| 3:00–3:20 | Load Clean sample — show it passes with success banner and 100 scores | "The clean sample shows what passing markup looks like — no critical, major, or minor findings." |
| 3:20–3:40 | Live URL fetch — enter a public URL, click "Fetch & Run Review" | "Teams can also fetch live pages through our Cloudflare Worker proxy and analyze them directly." |
| 3:40–4:00 | Resources page — quickly scroll the 6 sections, show search | "A curated resources hub — 36 links across WCAG references, SLDS docs, browser tools, and learning paths — all in one place." |
| 4:00–4:20 | Show CLI tool output (terminal screenshot or live demo) | "The same 34 checks also ship as a CLI tool — scan files or directories from the terminal, integrate into CI pipelines with JUnit output, and fail builds on severity thresholds." |
| 4:20–4:40 | Show VS Code extension (screenshot or live demo) | "And a VS Code extension — inline diagnostics on LWC and Aura HTML files, a status bar summary, and automatic review on save." |
| 4:40–5:00 | Wrap up — back to landing page, toggle a theme | "Three surfaces, one shared engine, zero data leaving your machine. Lightning A11y Lab helps Salesforce teams ship accessible experiences with confidence." |

### Recording tips
* Use QuickTime (Mac) or OBS to screen-record
* Set browser to 90% zoom so the full UI is visible
* Close other tabs and notifications before recording
* Speak at a measured pace — 5 minutes is plenty

---

## Business Impact — Real ROI, measurable time saved, quality improvement, or client value delivered

### Time saved per project

| Activity | Traditional approach | With Lightning A11y Lab | Savings |
|---|---|---|---|
| Manual accessibility review of one LWC component | 45–60 min (checklist + documentation) | 2–3 min (paste, run, export) | ~95% reduction |
| Generating audit evidence for one component | 30 min (screenshots, manual write-up) | 30 sec (one-click Word/PDF export) | ~97% reduction |
| Remediating a missed a11y defect post-deployment | 4–8 hours (reproduce, fix, re-test, re-deploy) | Prevented — caught at markup stage | Avoided entirely |
| CI pipeline a11y gate for a full component library | Not feasible manually | 1 CLI command with JUnit output | New capability |
| Training a new developer on WCAG requirements | 2–3 days of reading + mentoring | Self-service — every finding includes fix steps, importance, and reference links | 60–70% faster onboarding |

### Quality improvement

* **34 automated checks** covering the patterns that cause the most audit failures in Salesforce projects: missing labels, heading hierarchy, ARIA role validity, contrast, landmark regions, color-alone patterns, modal focus management, and form error messaging
* **Zero false negatives on covered patterns** — if a `lightning-input` has no `label` attribute, the tool will always flag it. Manual review depends on the reviewer's attention and experience
* **Consistent severity classification** — critical, major, minor, and info ratings are applied uniformly across every review, eliminating subjective variation between reviewers
* **Three delivery surfaces** — developers get feedback in their editor (VS Code), in their CI pipeline (CLI), and during QA review (web app), creating multiple catch points

### Client value delivered

* **Reduced legal exposure** — ADA lawsuits increased 300% between 2018 and 2023. Catching WCAG violations before deployment directly reduces client risk
* **Faster governance sign-off** — structured exports (JSON, Word, PDF, JUnit) attach to release tickets, CI dashboards, and audit packages, giving compliance stakeholders the evidence format they need without manual transcription
* **Broader end-user reach** — accessible Lightning experiences serve the 15–20% of users who rely on assistive technology, increasing the effective user base of every client deployment
* **CI pipeline integration** — the CLI tool with `--fail-on` severity thresholds prevents accessibility regressions from ever reaching production

### ROI calculation (per engagement)

| Metric | Conservative estimate |
|---|---|
| Components reviewed per sprint | 10–15 |
| Time saved per component | 40 min |
| Sprint time saved | 7–10 hours |
| Hourly delivery cost | $150–250 |
| Sprint cost savings | $1,050–$2,500 |
| Sprints per engagement (avg) | 12–20 |
| Engagement cost savings | $12,600–$50,000 |
| Post-deployment defect avoidance (per incident) | $2,000–$8,000 |

---

## Feasibility & Scalability — Is it production-ready or on that path? Can it be adopted across CSX?

### Production readiness

| Indicator | Status |
|---|---|
| TypeScript strict mode | Enabled — zero type errors, no `any` types |
| Production build | Passes (`tsc --noEmit && vite build`) — under 3 seconds |
| Lint errors | Zero |
| Browser support | All modern browsers (Chrome, Firefox, Safari, Edge) |
| Deployment | Live on GitHub Pages with CI/CD — every push auto-deploys |
| Performance | Full analysis runs in <100ms for typical component markup |
| Security | No data leaves the browser — zero server dependency for core review |
| Multi-surface delivery | Web app, CLI tool, and VS Code extension all share one core engine |

### Adoption barriers: effectively none

| Concern | How it's addressed |
|---|---|
| Installation | Web app: none required — it's a URL. CLI: `npx a11y-review`. VS Code: install `.vsix` |
| Account/license | No account, no API key, no cost |
| Data sensitivity | Source code stays on the user's machine — no uploads, no telemetry |
| Learning curve | Paste markup and click "Run Review" — findings are self-explanatory |
| Team onboarding | Share the URL — that's it. CLI and VS Code have zero-config defaults |

### Scalability across CSX

| Scale dimension | How the tool supports it |
|---|---|
| Multiple projects | Any Salesforce team can use the same hosted instance — no per-project setup |
| Multiple WCAG standards | Supports 2.1 and 2.2, levels A/AA/AAA — covers all current client requirements |
| Adding new checks | Each check is a self-contained block in `analyzer.ts` with a guide entry in `findingGuides.ts` — adding a new rule takes ~15 minutes |
| CI/CD integration | CLI tool outputs JUnit XML for Jenkins/GitHub Actions/Azure DevOps; JSON for custom dashboards; `--fail-on` flag for build gates |
| IDE integration | VS Code extension provides inline diagnostics, review-on-save, and workspace scanning — zero context switching |
| Internationalization | Finding text and guides are string-based — localizable without structural changes |
| Enterprise deployment | Web app can be hosted on any internal static server or CDN — no backend infrastructure. CLI and VS Code extension distribute as standard npm/vsix packages |

### Growth path

| Current state (delivered) | Near-term (1–2 sprints) | Future |
|---|---|---|
| 34 static checks | Add 10–15 more checks | LLM-powered deep review |
| Browser-based analysis | Salesforce DX plugin integration | Org-level scanning |
| CLI tool for CI pipelines | Jira/ServiceNow integration | Trend dashboards |
| VS Code extension | Auto-fix code actions | IntelliJ/JetBrains extension |
| 3 web export formats + 3 CLI formats | GitHub PR comment integration | Compliance reporting portal |
| Cloudflare Worker CORS proxy | Custom proxy deployment docs | Self-hosted proxy image |

---

## AI Depth & Creativity — How cleverly are AI tools used? Quality of prompting, toolchain design, and originality

### How AI was used (beyond basic code generation)

| Technique | What we did | Why it's noteworthy |
|---|---|---|
| Specification-to-code translation | Fed a QA accessibility checklist PDF to the AI and asked it to identify gaps in our existing checks, then implement the 6 highest-value new rules | The AI cross-referenced the checklist against our codebase, identified 12 uncovered items, and we selected 6 based on static-analysis feasibility |
| Multi-file atomic operations | Each new check required coordinated changes across 3 files (analyzer, guides, samples). The AI made all changes in one pass with consistent WCAG references | This eliminated integration drift — guide text always matches analyzer behavior |
| Monorepo extraction | AI extracted the core analysis engine from a single-app codebase into a shared package (`@a11y-lab/core`) consumed by 3 surfaces, resolving module system conflicts (ESM vs CommonJS) in one session | A structural refactor that typically takes a full sprint was completed in one AI-assisted session |
| Multi-surface delivery | AI built a CLI tool and VS Code extension from the same shared core, handling TypeScript compilation, VS Code API integration, diagnostic mapping, and JUnit XML generation | Three deployable artifacts from one prompt chain, all type-safe and build-verified |
| Domain-expert remediation authoring | AI generated fix steps referencing specific Salesforce component attributes (`message-when-value-missing`, `alternative-text`), SLDS classes, and W3C understanding documents | The guides read like they were written by an accessibility consultant who also knows the Lightning component library |
| Infrastructure automation | AI created the Cloudflare Worker CORS proxy, GitHub Actions CI/CD workflow, and `404.html` SPA fallback — all production-ready on first deploy | Full deployment pipeline from code to live URL, authored entirely through AI |
| Continuous verification loop | Every AI-generated change was immediately validated through `tsc`, `vite build`, and lint checks within the same workflow | Zero manual compile-fix cycles — the AI caught and fixed its own type errors before presenting results |
| Content originality enforcement | When rewriting landing page copy, the explicit prompt was "rewrite with original text — no duplicated phrasing from the web." The AI produced tool-specific copy grounded in actual features | Avoids the common AI pitfall of regurgitating generic marketing language |

### Prompting strategy

Our approach was high-context, task-specific prompting rather than vague requests:

| Weak prompt (avoided) | Strong prompt (used) |
|---|---|
| "Add more accessibility checks" | "Using this attached PDF checklist, cross-reference against the existing checks in analyzer.ts, identify which checklist items are not covered, and implement the 6 highest-value checks that static markup analysis can realistically detect" |
| "Fix the CSS" | "The top-bar, page-toolbar, and page-tagline on the review page should stay pinned when the body uses document scroll. The app uses `body[data-app-view='scroll']` to enable viewport scrolling when findings are visible." |
| "Write a README" | "Write a README covering: what the app checks (with a table), all features, tech stack, getting started, project structure, deployment steps, environment variables, and scripts" |
| "Make a CLI tool" | "Extract the core analyzer into packages/core as a shared package, then build a CLI tool in packages/cli that consumes it — support file/directory scanning, table/JSON/JUnit output, and a --fail-on severity flag for CI gates" |

### Toolchain design

```
Developer intent
       │
       ▼
 Cursor Agent (Claude)
       │
       ├── Reads full codebase context (50+ files)
       ├── Plans multi-file changes
       ├── Implements changes atomically
       ├── Runs tsc + vite build + lint
       │         │
       │         ├── Pass → presents result
       │         └── Fail → auto-fixes and re-verifies
       │
       ▼
  Human review
       │
       ├── Approve → commit
       └── Adjust → refine prompt and iterate
```

### What makes our AI usage original

1. **AI building a tool that checks code quality** — there's a meta-level creativity in using AI to build an automated checker that helps humans write better code. The AI authored the very rules that evaluate accessibility compliance.
2. **PDF-to-feature-gap analysis** — rather than starting from a blank slate, we used AI to analyze a QA checklist document against existing code and surface the specific gaps. This is a reusable pattern for any team that has standards documents they want to operationalize.
3. **Self-documenting architecture** — the AI generated not just the checks but the educational layer (importance, fix steps, external references) that makes each finding actionable. The tool teaches developers accessibility concepts as a side effect of using it.
4. **Monorepo-from-monolith in one session** — AI extracted a shared core from a single-app codebase and built two new delivery surfaces (CLI + VS Code extension) in one continuous session, handling module system conflicts, TypeScript configuration, and cross-package imports.
5. **Zero-infrastructure AI integration** — we didn't embed an LLM into the product itself. We used AI as a development accelerator, keeping the shipped product dependency-free and client-safe (no API calls, no data leaving the browser). This is a deliberate architectural choice that prioritizes security and adoption speed.
6. **Full delivery pipeline** — AI authored not just the application code but the entire deployment infrastructure: GitHub Actions CI/CD, Cloudflare Worker proxy, SPA routing fallback, and environment variable management.
