# Lightning A11y Lab

Static accessibility checker for Salesforce Lightning (LWC & Aura) markup. Paste a template, choose a WCAG target, and get severity-ranked findings with remediation guidance — entirely in the browser.

**Live demo:** [perooru-s.github.io/NextGenUserExperienceLab](https://perooru-s.github.io/NextGenUserExperienceLab/)

## What It Checks

| Category | Examples |
|---|---|
| **Accessibility** | Missing alt text, unlabeled inputs/buttons, heading hierarchy, landmark regions, ARIA role validation, inline contrast, color-alone patterns, form error messaging |
| **Mobile** | Fixed pixel widths (reflow), small SLDS control variants (target size) |
| **UX Consistency** | Lightning-card titles, form grouping, div-only layouts without SLDS |
| **SLDS Patterns** | Encourages SLDS grid/spacing utilities over ad-hoc markup |

25+ static checks mapped to WCAG 2.1 and 2.2 success criteria at levels A, AA, and AAA.

## Features

- **WCAG version and level selection** — target 2.1 or 2.2 at A, AA, or AAA; findings adjust accordingly
- **Multi-dimensional quality scores** — performance, accessibility, best practices, and SEO lenses scored 0–100
- **Inline contrast analysis** — evaluates `color` / `background-color` pairs in `style` attributes against WCAG thresholds
- **Export reports** — JSON, Word (.docx), and PDF generated client-side for governance workflows
- **Live URL fetch** — pull page HTML from a URL into the editor (via dev proxy or CORS-friendly pages)
- **Client-side only** — no data leaves your browser; no account or API key required
- **Bundled demo samples** — "Issues" sample triggers findings across all categories; "Clean" sample passes static analysis

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Routing | React Router v7 |
| Build | Vite 5 |
| Export | jsPDF, docx |
| Deployment | GitHub Pages (via GitHub Actions) |

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

The built files go to `dist/`.

## Project Structure

```
src/
├── lib/
│   ├── analyzer.ts          # Static analysis engine (all checks)
│   ├── colors.ts            # Inline style contrast analysis
│   ├── dimensionScores.ts   # Quality score computation
│   ├── exportReport.ts      # JSON / Word / PDF export
│   ├── fetchPageSource.ts   # Live URL fetcher
│   └── findingGuides.ts     # Remediation guides per check
├── review/
│   ├── ReviewApp.tsx         # Review route entry
│   ├── ReviewLayout.tsx      # Top bar, toolbar, chrome
│   ├── ReviewConsolePage.tsx # Source editor + findings panel
│   ├── ReviewSessionContext.tsx
│   ├── FindingsPanel.tsx     # Findings list, filters, search
│   ├── reviewUi.tsx          # Score cards, icons, UI fragments
│   ├── reviewSamples.ts     # Bundled demo markup
│   └── findingsFilterUtils.ts
├── App.tsx                   # Router and lazy loading
├── LandingPage.tsx           # Marketing home
├── AccessibilityResourcesPage.tsx
├── ContactPage.tsx
├── themes.ts                 # Theme definitions
├── types.ts                  # Core domain types
└── index.css / App.css       # Design tokens and styles
```

## Deployment

The repo includes a GitHub Actions workflow (`.github/workflows/deploy-github-pages.yml`) that builds and deploys on every push to `main`.

### First-time setup

1. Go to **Settings > Pages > Build and deployment > Source** and select **GitHub Actions**
2. (Optional) Add a `SITE_PASSWORD` repository secret under **Settings > Secrets and variables > Actions** to enable the password gate
3. Push to `main` — the workflow builds and deploys automatically

The site will be available at `https://<username>.github.io/NextGenUserExperienceLab/`.

## Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `VITE_BASE_PATH` | Base URL path for the app (auto-set by CI) | No |
| `VITE_SITE_PASSWORD` | Enables a password gate before the app loads | No |
| `VITE_PAGE_FETCH_PROXY` | Proxy URL for the Live URL fetch feature | No |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build + SPA 404 fallback |
| `npm run preview` | Preview production build locally |
| `npm run ppt:overview` | Generate an overview slide deck (pptxgenjs) |

## Team

- **Perooru Subbanarasaiah** — User Experience
- **Naveen Kumar Gurramkonda** — Testing Expert

## License

This project is private and proprietary.
