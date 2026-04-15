import { useEffect, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MarketingFooter } from "./MarketingFooter";
import { MarketingHeader } from "./MarketingHeader";
import "./AccessibilityResourcesPage.css";

type ResourceItem = {
  label: string;
  href: string;
  description: string;
};

type ResourceSection = {
  id: string;
  title: string;
  intro?: string;
  items: ResourceItem[];
};

const SECTIONS: ResourceSection[] = [
  {
    id: "standards",
    title: "WCAG & W3C references",
    intro: "Primary sources for criteria text, techniques, and conformance language used in audits.",
    items: [
      {
        label: "WCAG 2.2 at a glance",
        href: "https://www.w3.org/WAI/standards-guidelines/wcag/",
        description: "Official W3C WAI overview and how WCAG is structured by principles and levels.",
      },
      {
        label: "Understanding WCAG 2.2",
        href: "https://www.w3.org/WAI/WCAG22/Understanding/",
        description: "Intent, benefits, and examples for each success criterion—ideal when triaging findings.",
      },
      {
        label: "How to Meet WCAG (quick reference)",
        href: "https://www.w3.org/WAI/WCAG22/quickref/",
        description: "Filterable checklist linking criteria to techniques—handy during design and code review.",
      },
      {
        label: "ARIA Authoring Practices Guide (APG)",
        href: "https://www.w3.org/WAI/ARIA/apg/",
        description: "Patterns for accessible widgets, keyboard behavior, and roles/states.",
      },
      {
        label: "WAI tutorials (page structure, forms, images, tables, carousels)",
        href: "https://www.w3.org/WAI/tutorials/",
        description: "Step-by-step guidance from W3C WAI—pairs well with criteria from Understanding WCAG.",
      },
      {
        label: "Techniques for WCAG 2.2",
        href: "https://www.w3.org/WAI/WCAG22/Techniques/",
        description: "Index of sufficient, advisory, and failure techniques mapped to success criteria.",
      },
      {
        label: "WAI: Easy Checks",
        href: "https://www.w3.org/WAI/test-evaluate/easy-checks/",
        description: "Short checks anyone can run (headings, contrast, keyboard, forms)—good for demos and smoke tests.",
      },
      {
        label: "WCAG-EM overview (evaluation methodology)",
        href: "https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/",
        description: "Structured approach when you need repeatable conformance reporting across a site or product.",
      },
    ],
  },
  {
    id: "browser-tools",
    title: "Browser extensions & automated checks",
    intro: "Complement static markup review with runtime checks in dev tools (not a replacement for manual QA).",
    items: [
      {
        label: "axe DevTools",
        href: "https://www.deque.com/axe/devtools/",
        description: "Rules-based scanning in Chrome/Edge/Firefox; good for catching many WCAG failures in the DOM.",
      },
      {
        label: "Lighthouse accessibility audit",
        href: "https://developer.chrome.com/docs/lighthouse/accessibility/",
        description: "Chrome’s built-in audit category—useful smoke test alongside manual keyboard and SR passes.",
      },
      {
        label: "WAVE Evaluation Tool",
        href: "https://wave.webaim.org/extension/",
        description: "Visual feedback on page structure, ARIA, contrast, and errors/warnings from WebAIM.",
      },
      {
        label: "Accessibility Insights",
        href: "https://accessibilityinsights.io/",
        description: "Microsoft’s tools for FastPass and guided checks—strong for tab stops and live UI issues.",
      },
      {
        label: "IBM Equal Access Accessibility Checker",
        href: "https://github.com/IBMa/equal-access",
        description: "Open-source rules engine with browser extensions and automation hooks—useful in enterprise toolchains.",
      },
      {
        label: "Firefox Accessibility Inspector",
        href: "https://firefox-source-docs.mozilla.org/devtools-user/accessibility_inspector/index.html",
        description: "Inspect accessibility tree, contrast, and name/role issues directly in Firefox DevTools.",
      },
    ],
  },
  {
    id: "salesforce",
    title: "Salesforce, Lightning & SLDS",
    items: [
      {
        label: "SLDS accessibility overview",
        href: "https://www.lightningdesignsystem.com/accessibility/overview/",
        description: "Salesforce Lightning Design System guidance for components and patterns.",
      },
      {
        label: "Build accessible apps (Trailhead)",
        href: "https://trailhead.salesforce.com/content/learn/modules/accessibility_basics",
        description: "Trailhead module covering accessibility basics on the platform.",
      },
      {
        label: "Lightning Design System",
        href: "https://www.lightningdesignsystem.com/",
        description: "Component reference and design tokens—pair with accessibility notes per component.",
      },
      {
        label: "LWC: Create accessible components",
        href: "https://developer.salesforce.com/docs/component-library/documentation/en/lwc/create_components_accessibility",
        description: "Official guidance for Lightning Web Components: focus, ARIA, events, and testing considerations.",
      },
      {
        label: "LWC Developer Guide",
        href: "https://developer.salesforce.com/docs/platform/lwc/guide",
        description: "Platform LWC documentation hub—cross-link from accessibility topics to rendering and data flow.",
      },
      {
        label: "Trailhead: Get Started with Web Accessibility",
        href: "https://trailhead.salesforce.com/content/learn/modules/web-accessibility",
        description: "Broader web accessibility module—useful before deep platform-specific work.",
      },
    ],
  },
  {
    id: "learning",
    title: "Learning & deep dives",
    items: [
      {
        label: "MDN: Accessibility",
        href: "https://developer.mozilla.org/en-US/docs/Web/Accessibility",
        description: "Web platform fundamentals—semantics, ARIA, keyboard, and media accessibility.",
      },
      {
        label: "Deque University (free samples)",
        href: "https://dequeuniversity.com/",
        description: "Short lessons and quizzes on testing concepts and common failure modes.",
      },
      {
        label: "WebAIM articles",
        href: "https://webaim.org/articles/",
        description: "Practical articles on contrast, forms, screen readers, and more.",
      },
      {
        label: "web.dev: Learn Accessibility",
        href: "https://web.dev/learn/accessibility/",
        description: "Google’s free course-style modules spanning design, markup, ARIA, and testing mindset.",
      },
      {
        label: "MDN: ARIA",
        href: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA",
        description: "Reference hub for roles, states, properties, and when native HTML is enough.",
      },
      {
        label: "Microsoft Learn: Accessibility fundamentals",
        href: "https://learn.microsoft.com/en-us/training/paths/accessibility-fundamentals/",
        description: "Foundational path covering disability, assistive tech, and inclusive design in Microsoft ecosystems.",
      },
    ],
  },
  {
    id: "patterns",
    title: "Design, patterns & checklists",
    intro: "Translate WCAG intent into day-to-day design and component decisions.",
    items: [
      {
        label: "The A11Y Project checklist",
        href: "https://www.a11yproject.com/checklist/",
        description: "Actionable checklist from content to keyboard—handy for PR templates and definition-of-done.",
      },
      {
        label: "Inclusive Components",
        href: "https://inclusive-components.design/",
        description: "Heydon Pickering’s patterns (menus, toggles, dialogs) with accessibility-first reasoning.",
      },
      {
        label: "Human Interface Guidelines: Accessibility (Apple)",
        href: "https://developer.apple.com/design/human-interface-guidelines/accessibility",
        description: "Platform expectations for labels, motion, VoiceOver, and Dynamic Type—relevant for hybrid mobile.",
      },
    ],
  },
  {
    id: "manual",
    title: "Manual verification & assistive tech",
    intro: "Automated tools miss context; plan time for keyboard-only paths and screen reader spot checks.",
    items: [
      {
        label: "MDN: Keyboard-navigable JavaScript widgets",
        href: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets",
        description: "Focus management and keyboard patterns for custom controls.",
      },
      {
        label: "NV Access (NVDA)",
        href: "https://www.nvaccess.org/download/",
        description: "Free screen reader for Windows—common in enterprise accessibility test matrices.",
      },
      {
        label: "Apple: VoiceOver User Guide",
        href: "https://support.apple.com/guide/voiceover/welcome/mac",
        description: "Built-in macOS/iOS screen reader—use on real devices for Safari + Lightning.",
      },
      {
        label: "WebAIM: Contrast Checker",
        href: "https://webaim.org/resources/contrastchecker/",
        description: "Verify foreground/background pairs with WCAG contrast formulas—especially for custom hex values.",
      },
      {
        label: "WebAIM: Keyboard accessibility",
        href: "https://webaim.org/techniques/keyboard/",
        description: "How to test focus order, visible focus, and keyboard traps without a screen reader.",
      },
      {
        label: "Google: Get started on Android with TalkBack",
        href: "https://support.google.com/accessibility/android/answer/6283677",
        description: "Official TalkBack orientation for testing Android experiences alongside web and hybrid apps.",
      },
      {
        label: "Windows 11 accessibility (incl. Narrator)",
        href: "https://www.microsoft.com/en-us/accessibility/windows",
        description: "Microsoft’s hub for Narrator, contrast themes, and related vision features—useful when NVDA is not available.",
      },
    ],
  },
];

export default function AccessibilityResourcesPage() {
  const searchId = useId();
  const [query, setQuery] = useState("");

  const totalCount = useMemo(() => SECTIONS.reduce((n, s) => n + s.items.length, 0), []);

  const filteredSections = useMemo(() => {
    const terms = query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (terms.length === 0) return SECTIONS;
    return SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const hay = [item.label, item.description, section.title, section.intro ?? ""].join(" ").toLowerCase();
        return terms.every((t) => hay.includes(t));
      }),
    })).filter((s) => s.items.length > 0);
  }, [query]);

  const visibleCount = useMemo(
    () => filteredSections.reduce((n, s) => n + s.items.length, 0),
    [filteredSections]
  );

  useEffect(() => {
    document.body.dataset.appView = "scroll";
    return () => {
      delete document.body.dataset.appView;
    };
  }, []);

  useEffect(() => {
    const prev = document.title;
    document.title = "Learn & Resources — LIGHTNING A11Y LAB";
    return () => {
      document.title = prev;
    };
  }, []);

  const hasActiveFilter = query.trim().length > 0;
  const noResults = hasActiveFilter && visibleCount === 0;

  return (
    <div className="arp">
      <MarketingHeader />
      <main id="top" className="arp-main" tabIndex={-1}>
        <header className="arp-masthead" aria-labelledby="arp-masthead-title">
          <img
            className="arp-masthead-photo"
            src={`${import.meta.env.BASE_URL}learn-resources-masthead.png`}
            alt=""
            width={1600}
            height={900}
            decoding="async"
            fetchPriority="high"
          />
          <div className="arp-masthead-scrim" aria-hidden="true" />
          <div className="arp-masthead-inner">
            <nav className="arp-masthead-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true"> / </span>
              <span className="arp-masthead-breadcrumb-current">Learn &amp; Resources</span>
            </nav>

            <p className="arp-masthead-eyebrow">Curated library</p>
            <h1 id="arp-masthead-title" className="arp-masthead-title">
              Learn &amp; Resources
            </h1>
            <p className="arp-masthead-lead">
              Standards, SLDS, browser tools, patterns, and assistive-tech guides in one place. Filter by keyword—titles,
              descriptions, and section names are all searched.
            </p>

            <form className="arp-search" role="search" onSubmit={(e) => e.preventDefault()}>
              <label className="sr-only" htmlFor={searchId}>
                Search resources
              </label>
              <div className="arp-search-field">
                <span className="arp-search-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id={searchId}
                  className="arp-search-input"
                  type="search"
                  name="resource-search"
                  placeholder="Search e.g. WCAG, NVDA, Trailhead, contrast…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setQuery("");
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  enterKeyHint="search"
                />
                {hasActiveFilter ? (
                  <button
                    type="button"
                    className="arp-search-clear"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <p className="arp-search-meta" aria-live="polite">
                {noResults ? (
                  <>No matches for &quot;{query.trim()}&quot;.</>
                ) : hasActiveFilter ? (
                  <>
                    Showing <strong>{visibleCount}</strong> of {totalCount} links
                  </>
                ) : (
                  <>
                    <strong>{totalCount}</strong> curated links in {SECTIONS.length} topics
                  </>
                )}
              </p>
            </form>

            <div className="arp-masthead-actions">
              <Link className="arp-btn-primary arp-btn-primary--on-dark" to="/review">
                Open review console
              </Link>
              <Link className="arp-btn-ghost" to="/#learn" preventScrollReset>
                Learn intro on home
              </Link>
            </div>
          </div>
        </header>

        <div className="arp-wrap">
          {noResults ? (
            <div className="arp-empty" role="status">
              <p className="arp-empty-text">Try a shorter keyword, browse the topics below with search cleared, or jump home.</p>
              <button type="button" className="arp-btn-secondary" onClick={() => setQuery("")}>
                Reset search
              </button>
            </div>
          ) : null}

          {!noResults ? (
            <div className="arp-toc" role="navigation" aria-label="On this page">
              <h2 className="arp-toc-title">Jump to</h2>
              <ul className="arp-toc-list">
                {filteredSections.map((s) => (
                  <li key={s.id}>
                    <a
                      className="arp-toc-btn"
                      href={`#${s.id}`}
                      aria-label={`${s.title}, ${s.items.length} ${s.items.length === 1 ? "link" : "links"}`}
                    >
                      <span className="arp-toc-btn-row" aria-hidden="true">
                        <span className="arp-toc-btn-label">{s.title}</span>
                        <span className="arp-toc-count">{s.items.length}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {!noResults
            ? filteredSections.map((section) => (
                <section key={section.id} id={section.id} className="arp-section" aria-labelledby={`arp-h-${section.id}`}>
                  <h2 id={`arp-h-${section.id}`} className="arp-section-title">
                    <span className="arp-section-title-text">{section.title}</span>
                    <span className="arp-section-count" aria-hidden="true">
                      {section.items.length}
                    </span>
                    <span className="sr-only">
                      , {section.items.length} {section.items.length === 1 ? "link" : "links"}
                    </span>
                  </h2>
                  {section.intro ? <p className="arp-section-intro">{section.intro}</p> : null}
                  <ul className="arp-resource-list">
                    {section.items.map((item) => (
                      <li key={item.href} className="arp-resource-item">
                        <a className="arp-resource-link" href={item.href} target="_blank" rel="noopener noreferrer">
                          <span className="arp-resource-label">{item.label}</span>
                          <span className="arp-resource-ext" aria-hidden="true">
                            ↗
                          </span>
                          <span className="sr-only"> (opens in new tab)</span>
                        </a>
                        <p className="arp-resource-desc">{item.description}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            : null}

          <div className="arp-footnote" role="note">
            <p>
              Have a link that should be listed here?{" "}
              <Link to="/contact">Contact us</Link> with the URL and a one-line reason it helps teams.
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
