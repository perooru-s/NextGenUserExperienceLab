# Accessibility & Lightning A11y Lab — Overview Document

> **Team:** NextGen Experience Lab – Designing quality at scale

---

## Part 1: Understanding Web Accessibility

### What Is Web Accessibility?

Web accessibility means designing and building digital experiences that every person can perceive, understand, navigate, and interact with — regardless of their abilities, disabilities, or the technology they use.

When we say "accessible," we mean a person who is blind can use a screen reader to navigate your application. A person with limited mobility can complete every task using only a keyboard. A person with low vision can read your content because the text has sufficient contrast. A person with a cognitive disability can understand your interface because it uses clear labels, consistent patterns, and plain language.

Accessibility is not a special feature added at the end. It is a fundamental quality of well-built software.

### Who Benefits from Accessibility?

The short answer: everyone.

**People with permanent disabilities**
- 1.3 billion people worldwide — roughly 16% of the global population — experience a significant disability (World Health Organization, 2023)
- This includes visual impairments (blindness, low vision, color blindness), hearing loss, motor/mobility limitations, cognitive and neurological conditions, and speech disabilities
- These users rely on assistive technologies — screen readers, switch devices, eye-tracking systems, magnification software, voice control — that only work when applications are built accessibly

**People with temporary or situational limitations**
- A broken arm, an eye infection, a noisy environment, bright sunlight on a screen, holding a baby — these are everyday situations where accessible design helps everyone
- Captions help someone in a loud room just as much as someone who is deaf
- Keyboard navigation helps a power user just as much as someone who cannot use a mouse

**Aging populations**
- As people age, vision, hearing, motor skills, and cognitive processing naturally change
- Accessible interfaces accommodate these changes without requiring specialized tools

**All users**
- Clear headings, labeled form fields, logical tab order, sufficient contrast, and predictable navigation patterns make every interface easier to use — for every person, every time

### Why Accessibility Matters for Organizations

**1. Legal and regulatory requirements**

Accessibility is not optional in many jurisdictions:

| Regulation | Scope | Key requirement |
|---|---|---|
| Americans with Disabilities Act (ADA) | United States — public and private entities | Digital services must be accessible; courts increasingly apply WCAG 2.1 AA as the standard |
| Section 508 (Rehabilitation Act) | United States — federal agencies and contractors | ICT must conform to WCAG 2.0 AA (updated standards reference 2.1) |
| European Accessibility Act (EAA) | European Union — effective June 2025 | Digital products and services sold in the EU must meet accessibility requirements |
| Accessibility for Ontarians with Disabilities Act (AODA) | Ontario, Canada | Public and large private organizations must meet WCAG 2.0 AA |
| EN 301 549 | European Union | Harmonized standard for ICT accessibility, references WCAG 2.1 AA |

ADA-related digital accessibility lawsuits in the United States have increased over 300% between 2018 and 2023. Remediating after a complaint or lawsuit costs significantly more than building accessibly from the start.

**2. Business value**

- **Larger addressable market** — 15–20% of any user base has some form of disability. Inaccessible applications exclude these users entirely.
- **Improved SEO** — accessible practices (semantic HTML, descriptive headings, alt text, labeled controls) directly improve search engine indexing and discoverability.
- **Reduced support costs** — clear, consistent interfaces generate fewer help tickets and reduce training time.
- **Brand reputation** — organizations that demonstrate inclusive design earn trust from clients, partners, and employees.

**3. Better engineering quality**

Accessible code is well-structured code. When developers write semantic HTML, use proper heading hierarchies, label form controls, and manage keyboard focus — the codebase is more maintainable, testable, and consistent. Accessibility forces good engineering habits.

### Understanding WCAG — The Global Standard

**WCAG (Web Content Accessibility Guidelines)** is the internationally recognized standard for web accessibility, published by the W3C (World Wide Web Consortium).

**Four principles (POUR):**

Every WCAG guideline maps to one of four principles:

| Principle | What it means | Example |
|---|---|---|
| **Perceivable** | Users must be able to perceive the information presented | Images have alt text; videos have captions; text has sufficient contrast |
| **Operable** | Users must be able to operate the interface | All functions work with a keyboard; users have enough time; navigation is predictable |
| **Understandable** | Users must be able to understand the content and interface | Labels are clear; errors are described; behavior is consistent |
| **Robust** | Content must work reliably across technologies | Valid HTML; proper ARIA usage; content works with current and future assistive technologies |

**Conformance levels:**

| Level | What it covers | Typical requirement |
|---|---|---|
| **A** | Minimum accessibility — addresses the most severe barriers | Baseline for all projects |
| **AA** | Addresses the most common barriers for the widest range of users | Required by most laws and contracts (ADA, Section 508, EAA) |
| **AAA** | Highest level of accessibility — addresses specialized needs | Aspirational; typically applied to specific content types |

**Versions:**

| Version | Status | Notable additions |
|---|---|---|
| WCAG 2.0 | Published 2008, still referenced in some laws | Foundational 61 success criteria |
| WCAG 2.1 | Published 2018, widely adopted | Added mobile, low vision, and cognitive criteria (78 total) |
| WCAG 2.2 | Published 2023, current recommendation | Added focus appearance, dragging alternatives, and redundant entry (87 total) |

Most current projects target **WCAG 2.1 AA** or **WCAG 2.2 AA**.

### Common Accessibility Issues in Web Applications

These are the patterns that cause the most audit failures — and the most real-world barriers for users:

| Issue | What goes wrong | Who is affected |
|---|---|---|
| **Missing alt text on images** | Screen readers announce "image" with no description | Blind and low-vision users |
| **Missing form labels** | Screen readers cannot identify what a field is for | Blind users; voice control users |
| **Poor heading hierarchy** | Skipping from H1 to H4, or using headings for visual styling only | Screen reader users who navigate by heading |
| **Insufficient color contrast** | Text blends into background; information lost | Low-vision users; users in bright environments |
| **Color as the only indicator** | "Red means error" without an icon or text label | Color-blind users (8% of males) |
| **Keyboard traps** | Focus enters a component (e.g. modal) but cannot leave | Keyboard-only users; switch device users |
| **Missing landmark regions** | No `<main>`, `<nav>`, `<header>`, `<footer>` | Screen reader users who navigate by landmark |
| **Invalid ARIA roles** | Misused roles create confusion instead of clarity | All assistive technology users |
| **No visible focus indicator** | Users cannot see where keyboard focus is | Keyboard-only users |
| **Inaccessible modals/overlays** | Focus not trapped inside, no close mechanism, background still interactive | Keyboard and screen reader users |

Every one of these issues is detectable through static analysis of markup — before the code ever reaches production.

### The Cost of Catching Accessibility Late

Accessibility defects follow the same cost curve as all software defects — but the stakes include legal exposure:

| Stage defect is found | Relative cost to fix | Risk level |
|---|---|---|
| During development (code review) | **1×** (baseline) | Low — contained to the developer |
| During QA/testing | **3–5×** | Medium — requires test cycle |
| During UAT/governance | **10×** | High — delays release; stakeholder visibility |
| Post-deployment (complaint/audit) | **30–100×** | Critical — legal exposure; brand damage; emergency remediation |

The takeaway: catching accessibility issues in markup — before code reaches a sandbox — is the most cost-effective quality strategy available.

---

## Part 2: Introducing Lightning A11y Lab

### The Problem We Solve

Salesforce delivery teams build Lightning Web Components (LWC) and Aura components that reach thousands of enterprise end users. These users include people who rely on screen readers, keyboards, magnification, or voice control.

Despite this, accessibility reviews in most Salesforce projects are:

- **Manual** — a QA engineer walks through a checklist, one component at a time
- **Late** — reviews happen during UAT or governance sign-off, after patterns have already propagated
- **Inconsistent** — different reviewers catch different things; severity ratings vary by experience
- **Undocumented** — findings live in spreadsheets or Slack threads, disconnected from the codebase

Lightning A11y Lab replaces this with an automated, consistent, and documented review process that runs at every stage of development.

### What Is Lightning A11y Lab?

Lightning A11y Lab is a multi-surface accessibility review platform purpose-built for Salesforce Lightning markup. It performs **34 static analysis checks** against LWC, Aura, and HTML markup, covering:

- Accessibility (ARIA, labels, headings, landmarks, focus management)
- UX consistency (SLDS patterns, component structure)
- Mobile responsiveness (viewport, touch targets)
- SEO and discoverability (meta, semantic structure)

Every finding includes:
- **Severity** (critical, major, minor, info)
- **Affected line** in the markup
- **WCAG success criterion** reference
- **Step-by-step remediation** guidance
- **External reference links** (W3C, MDN, SLDS, Trailhead)

### Three Delivery Surfaces, One Shared Engine

The tool ships as three complementary surfaces — all powered by the same core analysis engine (`@a11y-lab/core`):

**1. Browser-based review console**
- Paste markup or fetch HTML from any live URL
- Configure WCAG version (2.1 or 2.2) and level (A, AA, or AAA)
- Review findings with severity-ranked cards, category filters, and keyword search
- Export results as JSON, Word, or PDF
- No installation, no account, no data leaving your browser

**2. CLI tool (`a11y-review`)**
- Scan individual files or entire directories from the terminal
- Output as colored table (human-readable), JSON (machine-readable), or JUnit XML (CI integration)
- `--fail-on` flag for CI pipeline gates (e.g. fail the build if any major+ findings exist)
- Integrates with Jenkins, GitHub Actions, Azure DevOps, or any CI system

**3. VS Code extension**
- Inline squiggly diagnostics on LWC and Aura HTML files
- Findings appear in the VS Code Problems panel with severity and WCAG references
- Status bar indicator with real-time issue count
- Review on save (configurable) — findings update automatically as you code
- "Review All Components" command — scans every component in the workspace

### What the Tool Checks

| # | Check | Severity | WCAG Criterion |
|---|---|---|---|
| 1 | Images missing alt text | Critical | 1.1.1 Non-text Content |
| 2 | Form inputs without labels | Critical | 1.3.1 Info and Relationships |
| 3 | Empty or placeholder-only labels | Major | 1.3.1 Info and Relationships |
| 4 | Lightning-input without label attribute | Critical | 4.1.2 Name, Role, Value |
| 5 | Lightning-card without title | Major | 4.1.2 Name, Role, Value |
| 6 | Heading hierarchy violations | Major | 1.3.1 Info and Relationships |
| 7 | Multiple H1 elements | Minor | 1.3.1 Info and Relationships |
| 8 | Missing landmark regions | Minor | 1.3.1 Info and Relationships |
| 9 | Invalid ARIA roles | Major | 4.1.2 Name, Role, Value |
| 10 | role="presentation" on focusable elements | Critical | 4.1.2 Name, Role, Value |
| 11 | Inline color contrast failures | Major | 1.4.3 Contrast (Minimum) |
| 12 | Color used as sole information indicator | Minor | 1.4.1 Use of Color |
| 13 | Form missing required/error patterns | Minor | 3.3.1 Error Identification |
| 14 | Modal/overlay missing focus management | Info | 2.4.3 Focus Order |
| 15 | Missing viewport meta tag | Major | 1.4.10 Reflow |
| 16 | Fixed-width containers | Minor | 1.4.10 Reflow |
| 17–34 | Additional checks for ARIA attributes, interactive elements, keyboard access, SLDS patterns, semantic structure, and more | Varies | Various |

### Architecture

```
@a11y-lab/core (shared engine — 34 checks, 33 remediation guides)
       │
       ├── Web app (React 18 + Vite → GitHub Pages)
       ├── CLI tool (a11y-review → terminal / CI pipelines)
       └── VS Code extension (inline diagnostics + status bar)
```

**Key architectural decisions:**

- **Zero server dependency** — all analysis runs in the browser (web app), on the local machine (CLI), or in-process (VS Code). No data ever leaves the user's environment.
- **Salesforce-aware rules** — checks understand `lightning-input`, `lightning-card`, `lightning-combobox`, SLDS utility classes, and Aura `aura:id` conventions.
- **Multi-dimensional scoring** — findings are grouped into Performance, Accessibility, Best Practices, and SEO & Discoverability lenses, each scored 0–100.
- **Educational by design** — 33 curated remediation guides teach developers *why* each pattern matters, not just *what* to fix.

### Technology Stack

| Layer | Technology |
|---|---|
| Shared analysis engine | @a11y-lab/core (TypeScript, zero dependencies) |
| Web app | React 18 + TypeScript, Vite 5, React Router v7 |
| CLI tool | Node.js + @a11y-lab/core |
| VS Code extension | VS Code Extension API + @a11y-lab/core |
| Exports | jsPDF (PDF), docx (Word), JSON |
| CORS proxy | Cloudflare Workers |
| Deployment | GitHub Pages + GitHub Actions CI/CD |
| Monorepo | npm workspaces |
| Standards | WCAG 2.1, WCAG 2.2, WAI-ARIA 1.2, SLDS |

### How It Fits Into the Development Workflow

```
Developer writes LWC/Aura component
       │
       ├── VS Code extension flags issues in real time (review on save)
       │
       ├── Developer pastes markup into web console for deeper review
       │
       ├── CI pipeline runs CLI tool — blocks merge on critical/major findings
       │
       ├── QA reviews exported findings (Word/PDF) against audit checklist
       │
       └── Governance team receives structured evidence package
```

The tool creates **four catch points** across the development lifecycle — ensuring accessibility issues are found at the earliest and cheapest stage possible.

### Additional Features

- **Accessibility Resources page** — 36 curated links across 6 categories (WCAG standards, SLDS accessibility, browser tools, testing frameworks, learning paths, communities)
- **7 visual themes** — with persistent preference via localStorage
- **Input validation** — clear error messaging for empty URLs and empty markup
- **Live URL fetching** — analyze any public web page via Cloudflare Worker CORS proxy
- **Marketing landing page** — with team profiles, FAQ, and accessibility impact content

### Impact Summary

| Metric | Value |
|---|---|
| Static analysis checks | 34 |
| Remediation guides | 33 (with fix steps, importance, and external links) |
| Delivery surfaces | 3 (web app, CLI, VS Code extension) |
| Export formats | 6 (JSON, Word, PDF on web; table, JSON, JUnit on CLI) |
| WCAG coverage | 2.1 and 2.2, levels A / AA / AAA |
| Curated resources | 36 links across 6 categories |
| Server dependencies | 0 (all analysis runs client-side) |
| Data exfiltration risk | 0 (nothing leaves the user's machine) |
| Time saved per component review | ~95% vs. manual review |
| Estimated engagement cost savings | $12,600–$50,000 |

---

> **Lightning A11y Lab** — helping Salesforce teams ship accessible experiences with confidence.
>
> **NextGen Experience Lab** – Designing quality at scale
>
> **Team:** Perooru Subbanarasaiah (User Experience) | Naveen Kumar Gurramkonda (Testing Expert)
