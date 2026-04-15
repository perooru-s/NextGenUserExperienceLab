# Judging Panel — Anticipated Questions & Answers

**Team:** NextGen Experience Lab — Designing quality at scale
**Solution:** Lightning A11y Lab
**Category:** Client Delivery

---

## General / Opening Questions

### Q1: In one sentence, what does your tool do?

Lightning A11y Lab is a browser-based static analysis tool that instantly reviews Salesforce LWC and Aura markup against 25+ WCAG checks, scores the component across four quality dimensions, and exports audit-ready reports in Word, PDF, or JSON — all without any data leaving the browser.

### Q2: What problem were you trying to solve?

Accessibility defects are one of the most common reasons Salesforce deliverables fail client acceptance and governance reviews. Today, catching these issues requires manual line-by-line review by someone who knows both WCAG standards and the Lightning component library. That expertise is scarce, the process is slow, and the results are inconsistent across reviewers. We wanted to eliminate that bottleneck entirely.

### Q3: Who is the target user?

Three audiences: (1) developers writing LWC/Aura markup who want immediate feedback before committing, (2) QA engineers validating components against accessibility checklists, and (3) delivery leads who need exportable evidence for governance packages and client sign-off.

---

## Business Impact

### Q4: Can you quantify the time savings?

A manual accessibility review of one Lightning component takes 45–60 minutes. Our tool does it in under 3 minutes — paste, run, review findings. That's roughly a 95% reduction. On a typical sprint with 10–15 components, that saves 7–10 hours. Over a 15-sprint engagement, the cumulative savings are 100–150 hours, which at delivery rates translates to $15,000–$37,000 per project.

### Q5: How does this improve quality versus just saving time?

Two ways. First, consistency — a human reviewer might catch 80% of issues on a good day and 50% on a busy Friday. The tool catches 100% of the patterns it covers, every time. Second, education — every finding includes an importance explanation, step-by-step fix instructions, and links to the relevant WCAG success criterion. Developers learn accessibility principles as they fix issues, which reduces defect recurrence over time.

### Q6: What's the ROI if we rolled this out across CSX?

If even 20 Salesforce projects per quarter use the tool, and each saves conservatively $12,000–$15,000 in review time and avoided rework, that's $240,000–$300,000 per quarter in delivery efficiency. And that doesn't count the risk reduction from preventing ADA compliance issues that could expose clients to legal action.

### Q7: Has a real project team used this yet?

Our team has been using it during development to validate our own sample markup and real project snippets. We haven't run a formal pilot with a client engagement yet, but the tool is live on GitHub Pages right now — any CSX team can start using it today with zero setup.

---

## Feasibility & Scalability

### Q8: Is this production-ready or a prototype?

It's production-ready for its current scope. TypeScript strict mode is enabled with zero type errors, the build completes in under 2 seconds, there are zero lint errors, and it's deployed via CI/CD on GitHub Pages. What makes it "production" versus "prototype" is that it's not a demo with hardcoded data — it actually parses and analyzes arbitrary markup in real time.

### Q9: What would it take for another team to adopt this?

Share the URL. That's the entire onboarding process. There's no installation, no account creation, no API key, no license. Since all analysis runs client-side in the browser, there are no infrastructure costs and no data privacy concerns — source code never leaves the developer's machine.

### Q10: How hard is it to add new checks?

About 15 minutes per check. Each check is a self-contained block in `analyzer.ts` — a regex or DOM pattern, a severity level, a WCAG reference, and a remediation message. You add a matching guide entry in `findingGuides.ts` with importance, fix steps, and links. The architecture is intentionally flat so that anyone with basic TypeScript knowledge can contribute rules.

### Q11: Can this integrate into CI/CD pipelines?

Yes. The JSON export is machine-readable and structured with severity, WCAG criterion, line numbers, and remediation text. A team could wire it into a CLI script or GitHub Action that fails a build if critical findings are present. That's on our near-term roadmap.

### Q12: What are the limitations?

It's static analysis, so it catches markup-level issues — missing labels, invalid ARIA roles, heading hierarchy problems. It cannot catch runtime behavior like focus management after a modal opens or dynamic content updates. We're transparent about this — the tool flags those patterns as informational reminders for manual verification rather than pretending it can automate what it can't.

### Q13: How does this compare to existing tools like axe or Lighthouse?

Axe and Lighthouse run against rendered pages in a browser — they're runtime tools. They're excellent but require a deployed or locally running application. Our tool works at the markup stage, before the component is even rendered. It's also Salesforce-specific — it understands `lightning-input`, `lightning-combobox`, SLDS classes, and Aura attributes. General-purpose tools don't know that a `lightning-input` needs a `message-when-value-missing` attribute. We complement those tools; we don't replace them.

---

## AI Depth & Creativity

### Q14: How did you use AI in building this?

AI was our development accelerator across the entire lifecycle — architecture design, implementation, accessibility domain expertise, CSS, content authoring, and deployment. But critically, every decision about what to build, which checks to prioritize, and how the UX should work was human-driven. AI executed; humans directed.

### Q15: Can you give a specific example of creative AI usage?

We fed a PDF accessibility checklist to the AI and asked it to cross-reference the checklist against our existing 19 checks in `analyzer.ts`, identify which items weren't covered, and rank the gaps by what static analysis can realistically detect. It identified 12 uncovered items, we selected 6, and the AI implemented all of them — analyzer logic, remediation guides, and sample markup — in coordinated changes across three files. That's a reusable pattern: take any standards document and use AI to find gaps in your implementation.

### Q16: Why didn't you embed AI into the tool itself (like an LLM-powered review)?

Deliberate choice. Embedding an LLM would require API calls, which means source code leaves the browser. That's a non-starter for client projects with sensitive IP. It would also add latency, cost, and a dependency on an external service. Our tool runs in under 100ms with zero network calls. We designed for maximum adoption and trust. An LLM-powered deep review is on the future roadmap as an opt-in feature, but the core tool must remain self-contained.

### Q17: How do you ensure AI-generated code is correct?

Every AI-generated change went through an immediate verification loop: TypeScript compilation (`tsc --noEmit`), production build (`vite build`), and lint checks — all within the same workflow. If anything failed, the AI fixed it before presenting the result. Beyond that, every finding the tool produces links to the specific WCAG success criterion, so the accuracy of each rule is verifiable against the W3C specification.

### Q18: What AI tools did you use and why?

Cursor IDE with Claude as the primary AI model. We chose Cursor because it maintains full codebase context — it can read 40+ files simultaneously and make coordinated changes across them. That's critical for a tool like this where a single new check touches the analyzer, the guide, and the sample data. We documented our full AI usage, prompting strategy, and toolchain design in `AI-TOOLS-DOCUMENTATION.md`.

---

## Curveball / Deeper Questions

### Q19: If you had two more weeks, what would you add?

Three things: (1) a CLI version so teams can run checks in CI/CD pipelines and fail builds on critical findings, (2) a Salesforce DX plugin that lets developers run reviews directly from VS Code, and (3) 10–15 additional checks covering touch target sizing, reflow at 400% zoom, and content-on-hover patterns from WCAG 2.2.

### Q20: Why "Client Delivery" as the category instead of "Innovation" or "Productivity Boost"?

Because the direct beneficiary is the client. Accessibility compliance is a client requirement — it's in SOWs, it's in acceptance criteria, and it's a legal obligation. When we catch a missing label before deployment instead of after, the client avoids a defect, a remediation cycle, and potential legal exposure. The productivity gains for our team are a byproduct — the primary value flows to the client.

### Q21: What's your team's accessibility expertise?

We're delivery professionals, not accessibility specialists — and that's actually the point. We built this tool because deep WCAG expertise shouldn't be a prerequisite for writing accessible components. The tool encodes that expertise into automated checks and actionable guidance so that any developer, regardless of their accessibility background, produces better markup.

### Q22: Could this work for non-Salesforce projects?

The architecture supports it. About 40% of our checks are HTML/ARIA-generic (heading hierarchy, landmark regions, ARIA role validity, color-alone patterns). The Salesforce-specific checks (Lightning component attributes, SLDS classes) are separate and clearly scoped. Adding a "generic HTML" mode or checks for another framework would follow the same pattern — new rules in the analyzer, new guides, same scoring engine.

---

## Quick-Reference Cheat Sheet

| If the judge asks about... | Key number to mention |
|---|---|
| Time savings per component | 95% reduction (45 min → 3 min) |
| Sprint savings | 7–10 hours per sprint |
| Engagement savings | $12,600–$50,000 per project |
| CSX-wide quarterly impact | $240,000–$300,000 |
| Number of checks | 25+ automated checks |
| Analysis speed | Under 100ms |
| Export formats | 3 (JSON, Word, PDF) |
| Setup required for new teams | Zero — share the URL |
| Time to add a new check | ~15 minutes |
| Data that leaves the browser | None |
| Build errors / lint errors | Zero |
| WCAG versions supported | 2.1 and 2.2, levels A/AA/AAA |
