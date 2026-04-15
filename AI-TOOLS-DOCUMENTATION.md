# AI Tools Documentation

**Team:** NextGen Experience Lab – Designing quality at scale
**Solution:** Lightning A11y Lab – Static Accessibility Checker for Salesforce Lightning

---

## 1. AI Tools Used

### Primary AI Tool: Cursor IDE with Claude (Anthropic)

| Attribute | Detail |
|---|---|
| Tool | Cursor IDE (AI-powered code editor) |
| AI Model | Claude by Anthropic (Opus 4) |
| Usage mode | Agent mode — iterative development with full codebase context |
| Duration | Used throughout the entire development lifecycle |

### How It Was Used

Cursor with Claude served as an AI-powered pair programmer across every phase of development:

| Phase | What the AI assisted with |
|---|---|
| **Architecture & planning** | Designing the static analysis engine, deciding check categories, structuring the multi-file codebase |
| **Feature implementation** | Writing the analysis rules in `analyzer.ts`, contrast detection in `colors.ts`, dimension scoring, export logic (JSON/Word/PDF), routing, and UI components |
| **Accessibility expertise** | Mapping checks to specific WCAG 2.1/2.2 success criteria, writing remediation guides with fix steps and reference links, ensuring the tool itself follows accessibility best practices (heading hierarchy, ARIA attributes, focus management) |
| **CSS & responsive design** | Implementing 7 theme variants, sticky header behavior, responsive layouts, score card grid, and mobile touch target sizing |
| **Content writing** | Drafting original landing page copy, README documentation, and finding guide text |
| **Code quality** | Full codebase audits — identifying dead code, fixing heading hierarchy issues, correcting `aria-labelledby` references, removing orphaned CSS selectors |
| **Deployment** | Configuring the GitHub Actions CI/CD workflow for GitHub Pages, resolving git authentication and push issues |
| **Submission preparation** | Structuring the business use case, solution overview, demo script, and this AI tools document |

---

## 2. Why Cursor + Claude Was Chosen

### Speed of iteration

The hackathon timeline demanded rapid development across a wide surface area — a full React application with 40+ source files, a custom static analysis engine, three export formats, a marketing site, and deployment infrastructure. Cursor's agent mode allowed us to describe intent ("add 6 new accessibility checks based on this PDF checklist") and receive working implementations across multiple files in a single iteration, rather than writing each check manually.

### Deep domain knowledge

Accessibility standards (WCAG 2.1, 2.2, WAI-ARIA 1.2) are reference-heavy and detail-sensitive. Claude demonstrated strong knowledge of specific success criteria (1.3.1, 4.1.2, 1.4.1, 3.3.1, etc.), valid ARIA role sets, and Salesforce-specific component patterns (lightning-input labels, SLDS class conventions, Aura structures). This meant the team could focus on which checks matter most for real Salesforce delivery projects rather than looking up specification details.

### Full codebase context

Unlike chat-based AI tools that see only pasted snippets, Cursor operates with full project context — reading all files, understanding imports and dependencies, and making coordinated changes across `analyzer.ts`, `findingGuides.ts`, `reviewSamples.ts`, `App.css`, and `index.css` in a single pass. This reduced integration errors and kept the codebase consistent.

### Built-in verification loop

Every change was immediately validated through TypeScript type-checking (`tsc --noEmit`), Vite production builds (`npm run build`), and linter checks — all run within the same AI workflow. Issues were caught and fixed before they accumulated.

---

## 3. What the AI Did NOT Do

Transparency about AI boundaries is important for judging:

| Area | Human-driven |
|---|---|
| **Problem selection** | The team identified the accessibility gap in Salesforce delivery workflows based on project experience |
| **Check prioritization** | The team decided which WCAG checks to implement based on a QA checklist and real audit failure patterns |
| **Design direction** | Visual design, theme palettes, and UX flow decisions were guided by the UX lead |
| **Testing & validation** | Manual browser testing, visual review of all pages, and accessibility verification were done by team members |
| **Business framing** | The submission narrative, category selection rationale, and impact framing reflect the team's delivery experience |

---

## 4. Other Tools and Technologies

These are non-AI tools used in the solution:

| Tool / Technology | Purpose | Why chosen |
|---|---|---|
| **React 18** | UI framework | Industry standard for component-based SPAs; strong TypeScript support; team familiarity |
| **TypeScript 5.6** | Type safety | Strict typing catches bugs at compile time; critical for a tool that itself checks code quality |
| **Vite 5** | Build tooling | Fast HMR in development, optimized production builds, native ESM support |
| **React Router v7** | Client-side routing | Declarative routing with lazy loading for the review module |
| **jsPDF** | PDF export | Client-side PDF generation — no server dependency, no data exfiltration |
| **docx** (npm) | Word export | Client-side .docx generation for governance-friendly report format |
| **pptxgenjs** | Slide deck generation | Produces overview presentations from code |
| **GitHub Actions** | CI/CD pipeline | Automated build and deploy to GitHub Pages on every push to main |
| **GitHub Pages** | Hosting | Free static hosting with custom domain support; zero infrastructure to manage |
| **Git** | Version control | Standard source control with branch-based workflow |

---

## 5. AI Impact Summary

| Metric | Without AI (estimate) | With AI (actual) |
|---|---|---|
| Time to build analysis engine (25+ checks) | 3–4 days | ~4 hours |
| Time to add 6 new checks from PDF checklist | 1–2 days | ~30 minutes |
| Time to write remediation guides (per check) | 20–30 min each | ~2 min each (AI-drafted, team-reviewed) |
| Full codebase audit + fixes | 4–6 hours | ~20 minutes |
| Landing page copy (original, non-duplicated) | 1–2 days | ~15 minutes |
| README + submission documentation | Half day | ~30 minutes |
| CSS debugging (sticky positioning, grid layout) | 2–3 hours | ~10 minutes |

**Estimated total time saved: 5–7 working days**, allowing the team to focus on check quality, design refinement, and testing rather than boilerplate implementation.

---

## 6. Contribution to AI Accelerator Library

### Reusable patterns demonstrated

1. **AI-assisted static analysis authoring** — using an AI agent to translate accessibility specifications into regex-based static checks, complete with WCAG criterion mapping and remediation guides
2. **Coordinated multi-file refactoring** — adding a feature (e.g. a new check) that touches the analyzer, guides, samples, and CSS in one atomic operation
3. **AI-driven content originality** — using AI to rewrite marketing copy from scratch rather than adapting existing web content, reducing plagiarism risk
4. **Continuous verification workflow** — integrating `tsc`, `vite build`, and lint checks into the AI iteration loop so errors are caught immediately

### Lessons learned

- **Specificity in prompts matters** — "add 6 checks based on this PDF" with the PDF attached produced better results than vague requests like "improve accessibility checking"
- **AI excels at reference-heavy work** — WCAG criterion numbers, valid ARIA role sets, and Salesforce component attribute names are exactly the kind of detail AI retrieves accurately
- **Human judgment remains essential** — the team decided which checks to prioritize, validated the output against real audit patterns, and made all design decisions
