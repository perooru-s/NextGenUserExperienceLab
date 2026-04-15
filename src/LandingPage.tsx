import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import "./LandingPage.css";

/** Hero showcase window — `public/lp-hero-showcase.jpg` */
const IMG_HERO_SHOWCASE = `${import.meta.env.BASE_URL}lp-hero-showcase.jpg`;
/** Card media — `public/lp-card-side-img.png` */
const IMG_CARD_SIDE = `${import.meta.env.BASE_URL}lp-card-side-img.png`;
/** Split “score” section photo — `public/lp-split-photo.jpg` */
const IMG_SPLIT_PHOTO = `${import.meta.env.BASE_URL}lp-split-photo.jpg`;
/** “Web accessibility is the law” — local asset in `public/law-library.png` */
const IMG_ACCESSIBILITY_LAW = `${import.meta.env.BASE_URL}law-library.png`;
/** Impact section backdrop — local asset in `public/lp-impact-texture.png` */
const IMG_IMPACT_TEXTURE = `${import.meta.env.BASE_URL}lp-impact-texture.png`;
/** Learn strip photo — `public/lp-learn-section-bg.png` */
const IMG_LEARN_SECTION_BG = `${import.meta.env.BASE_URL}lp-learn-section-bg.png`;

const TEAM = [
  {
    name: "Perooru Subbanarasaiah",
    email: "perooru.subbanarasaiah@pwc.com",
    role: "User Experience",
    photo: `${import.meta.env.BASE_URL}team/perooru.png`,
  },
  {
    name: "Naveen Kumar Gurramkonda",
    email: "gurramkonda.naveen.kumar@pwc.com",
    role: "Testing Expert",
    photo: `${import.meta.env.BASE_URL}team/naveen.png`,
  },
] as const;

const WHY_WEB_ACCESSIBILITY_POINTS = [
  {
    icon: "people" as const,
    headline: "A broader user base",
    body: "Over one billion people worldwide experience some form of disability. When your Lightning pages work for keyboard-only, screen reader, and low-vision users, you serve everyone—not just the majority.",
  },
  {
    icon: "legal" as const,
    headline: "Regulatory exposure",
    body: "ADA, Section 508, and the European Accessibility Act set enforceable standards. Catching WCAG violations in markup before release is far cheaper than remediating after a formal complaint or audit.",
  },
  {
    icon: "brand" as const,
    headline: "Stronger credibility",
    body: "Clients and internal stakeholders notice when digital products work for all users. Demonstrating proactive accessibility strengthens trust in your engineering and design standards.",
  },
  {
    icon: "inclusive" as const,
    headline: "Better UX for everyone",
    body: "Accessible patterns—clear headings, sufficient contrast, labeled controls, logical focus order—improve usability for every user, not only those relying on assistive technology.",
  },
] as const;

const FREE_TOOL_ADVANTAGE_POINTS = [
  {
    title: "Findings mapped to WCAG criteria",
    body: "Every finding links to the specific WCAG success criterion it addresses, with severity, remediation steps, and reference links so developers know exactly what to fix and why.",
  },
  {
    title: "WCAG 2.1 and 2.2 target selection",
    body: "Choose the conformance level (A, AA, or AAA) and version (2.1 or 2.2) that matches your project requirements. The engine filters and adjusts findings accordingly.",
  },
  {
    title: "Multi-dimensional quality scores",
    body: "Results are grouped into performance, accessibility, best practices, and SEO lenses—each scored 0–100—so teams can prioritize remediation by impact area.",
  },
  {
    title: "Export-ready for governance workflows",
    body: "Generate JSON, Word, or PDF reports directly in the browser. Attach them to pull requests, release notes, or audit evidence packages without manual transcription.",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "What does Lightning A11y Lab actually check?",
    a: "It performs static analysis on your LWC, Aura, or raw HTML markup—checking for missing labels, heading hierarchy, ARIA role validity, inline contrast, landmark structure, color-alone patterns, modal focus reminders, and more. Each finding maps to a WCAG success criterion with remediation guidance.",
  },
  {
    q: "Does my markup leave my browser?",
    a: "No. The analysis engine runs entirely in your browser tab. Your source code, findings, and exports stay on your machine unless you explicitly connect an external service. There is no server-side processing for the core review.",
  },
  {
    q: "Which WCAG versions and levels are supported?",
    a: "You can target WCAG 2.1 or 2.2 at conformance level A, AA, or AAA. The engine adjusts which findings are relevant—for example, target-size checks are scoped differently at AA vs. AAA, and 2.2-specific criteria like focus appearance are surfaced only when you select version 2.2.",
  },
  {
    q: "How do I share results with my team?",
    a: "Export findings as JSON (for programmatic consumption), Word (for stakeholder review), or PDF (for audit evidence). All exports are generated client-side and can be attached to pull requests, Jira tickets, or governance packages.",
  },
];

function IconWhyPeople() {
  return (
    <svg className="lp-why-a11y-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconWhyLegal() {
  return (
    <svg className="lp-why-a11y-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function IconWhyBrand() {
  return (
    <svg className="lp-why-a11y-icon lp-why-a11y-icon--fill" width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2l2.9 7.26L22 9.9l-5.8 4.74L18.18 22 12 18.27 5.82 22 7.8 14.64 2 9.9l7.1-.64L12 2z"
      />
    </svg>
  );
}

function IconWhyInclusive() {
  return (
    <svg className="lp-why-a11y-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function WhyAccessibilityIcon({ id }: { id: (typeof WHY_WEB_ACCESSIBILITY_POINTS)[number]["icon"] }) {
  switch (id) {
    case "people":
      return <IconWhyPeople />;
    case "legal":
      return <IconWhyLegal />;
    case "brand":
      return <IconWhyBrand />;
    case "inclusive":
      return <IconWhyInclusive />;
  }
}

function HeroShowcase() {
  return (
    <div className="lp-hero-showcase" aria-hidden>
      <div className="lp-hero-showcase-frame">
        <div className="lp-hero-showcase-chrome">
          <span className="lp-hero-showcase-dots" aria-hidden>
            <span className="lp-hero-showcase-dot lp-hero-showcase-dot--r" />
            <span className="lp-hero-showcase-dot lp-hero-showcase-dot--y" />
            <span className="lp-hero-showcase-dot lp-hero-showcase-dot--g" />
          </span>
          <span className="lp-hero-showcase-chrome-title">LIGHTNING A11Y LAB</span>
        </div>
        <div className="lp-hero-showcase-body">
          <div className="lp-hero-showcase-visual">
            <img
              className="lp-hero-showcase-img"
              src={IMG_HERO_SHOWCASE}
              alt=""
              width={1024}
              height={682}
              loading="lazy"
              decoding="async"
            />
            <div className="lp-hero-showcase-visual-scrim" />
            <span className="lp-hero-showcase-pill">WCAG · ADA · SLDS</span>
          </div>
          <div className="lp-hero-showcase-panel">
            <div className="lp-hero-showcase-metric">
              <span className="lp-hero-showcase-metric-label">Checks per scan</span>
              <strong className="lp-hero-showcase-metric-value">25+</strong>
              <span className="lp-hero-showcase-metric-hint">Static rules &amp; heuristics</span>
            </div>
            <div className="lp-hero-showcase-metric lp-hero-showcase-metric--accent">
              <span className="lp-hero-showcase-metric-label">Quality pulse</span>
              <svg className="lp-hero-showcase-spark" viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden>
                <path
                  className="lp-hero-showcase-spark-line"
                  d="M4 28 L28 24 L52 14 L76 10 L100 6 L116 8"
                  fill="none"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="lp-hero-showcase-metric">
              <span className="lp-hero-showcase-metric-label">Export formats</span>
              <div className="lp-hero-showcase-avatars">
                <span className="lp-hero-showcase-av" />
                <span className="lp-hero-showcase-av" />
                <span className="lp-hero-showcase-av" />
              </div>
              <span className="lp-hero-showcase-metric-hint">JSON · Word · PDF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const faqHeadingId = useId();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const location = useLocation();
  const lpRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* Header links use preventScrollReset so the router does not scroll the document; this is the only scroll to the target. */
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [location.hash, location.pathname]);

  useEffect(() => {
    const prev = document.title;
    document.title = "LIGHTNING A11Y LAB — Accessibility Checker";
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    document.body.dataset.appView = "scroll";
    return () => {
      delete document.body.dataset.appView;
    };
  }, []);

  useEffect(() => {
    const root = lpRootRef.current;
    if (!root) return;

    root.classList.add("lp-scroll-reveal");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sectionSelector = ".lp-main > section:not(.lp-hero)";
    const sections = Array.from(root.querySelectorAll<HTMLElement>(sectionSelector));

    if (reduced) {
      sections.forEach((el) => el.classList.add("lp-reveal-visible"));
      return () => {
        sections.forEach((el) => el.classList.remove("lp-reveal-visible"));
        root.classList.remove("lp-scroll-reveal");
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("lp-reveal-visible");
          observer.unobserve(entry.target);
        }
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.06 }
    );

    sections.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      sections.forEach((el) => el.classList.remove("lp-reveal-visible"));
      root.classList.remove("lp-scroll-reveal");
    };
  }, []);

  return (
    <div className="lp" ref={lpRootRef}>
      <MarketingHeader />

      <main id="top" className="lp-main" tabIndex={-1}>
        <section className="lp-hero" aria-labelledby="lp-hero-title">
          <div className="lp-wrap lp-hero-grid">
            <div className="lp-hero-copy">
              <h1 id="lp-hero-title" className="lp-hero-title">
                Catch accessibility gaps in your Lightning markup{" "}
                <em className="lp-hero-em">before they ship</em>
              </h1>
              <p className="lp-hero-sub">
                Paste LWC or Aura templates, pick a WCAG target, and get severity-ranked findings with fix guidance—right in your browser.
              </p>
              <div className="lp-hero-row">
                <Link className="lp-btn lp-btn-primary lp-btn-lg" to="/review">
                  Launch tool
                </Link>
              </div>
            </div>
            <HeroShowcase />
          </div>
        </section>

        <section className="lp-trust" aria-label="Trusted partners">
          <div className="lp-wrap lp-trust-inner">
            {["Salesforce", "WCAG 2.2", "SLDS", "ADA", "Lightning", "Enterprise QA"].map((name) => (
              <span key={name} className="lp-trust-logo">
                {name}
              </span>
            ))}
          </div>
        </section>

        <section id="why-accessibility" className="lp-section lp-section--why-a11y" aria-labelledby="lp-why-a11y-title">
          <div className="lp-wrap">
            <h2 id="lp-why-a11y-title" className="lp-h2 lp-h2--center">
              Why Web Accessibility Is Important
            </h2>
            <p className="lp-why-a11y-intro">
              Unlabeled inputs, broken heading hierarchies, low-contrast text, and missing landmarks silently exclude
              users who depend on keyboards, screen readers, or magnification. Catching these patterns at the markup
              stage prevents costly rework later in the delivery cycle.
            </p>
            <ul className="lp-why-a11y-grid">
              {WHY_WEB_ACCESSIBILITY_POINTS.map((item) => (
                <li key={item.headline}>
                  <article className="lp-why-a11y-card">
                    <div className="lp-why-a11y-icon-wrap" aria-hidden>
                      <WhyAccessibilityIcon id={item.icon} />
                    </div>
                    <h3 className="lp-why-a11y-card-title">{item.headline}</h3>
                    <p className="lp-why-a11y-card-body">{item.body}</p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="free-tool-checker"
          className="lp-section lp-section--tool-advantages"
          aria-labelledby="lp-free-tool-title"
        >
          <div className="lp-wrap lp-tool-advantages-head">
            <h2 id="lp-free-tool-title" className="lp-h2 lp-h2--center">
              What the Review Console Gives You
            </h2>
            <h3 className="lp-tool-advantages-subtitle">Built for Salesforce delivery teams</h3>
            <p className="lp-tool-advantages-intro">
              Paste your template, choose a WCAG target, and run the analysis. No account, no installation, no data
              leaving your browser. The console checks for real patterns that cause audit failures in Lightning
              projects—labels, contrast, headings, ARIA, landmarks, and more.
            </p>
          </div>
          <div className="lp-wrap">
            <ul className="lp-tool-advantages-grid">
              {FREE_TOOL_ADVANTAGE_POINTS.map((item) => (
                <li key={item.title}>
                  <article className="lp-tool-advantage-card">
                    <h4 className="lp-tool-advantage-title">{item.title}</h4>
                    <p className="lp-tool-advantage-body">{item.body}</p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="learn"
          className="lp-section lp-section--learn"
          aria-labelledby="lp-learn-title"
          style={{ "--lp-learn-photo": `url(${JSON.stringify(IMG_LEARN_SECTION_BG)})` } as CSSProperties}
        >
          <div className="lp-learn-texture" aria-hidden />
          <div className="lp-wrap">
            <h2 id="lp-learn-title" className="lp-h2 lp-h2--center">
              Learn &amp; Resources
            </h2>
            <p className="lp-learn-intro">
              Curated links to WCAG understanding documents, SLDS accessibility guidance, Salesforce Trailhead modules,
              browser dev tools, and assistive-technology testing references—all in one place.
            </p>
            <ul className="lp-learn-highlights" aria-label="Included on the resources page">
              <li>WCAG, WAI tutorials, techniques, and quick checks</li>
              <li>Salesforce Lightning, SLDS, and LWC accessibility documentation</li>
              <li>axe, Lighthouse, WAVE, Accessibility Insights, and Firefox inspector</li>
              <li>Learning paths, pattern libraries, and manual testing with NVDA, VoiceOver, and more</li>
            </ul>
            <div className="lp-learn-cta-row">
              <Link className="lp-btn lp-btn-primary lp-btn-lg" to="/resources">
                Open Accessibility Resources
              </Link>
            </div>
          </div>
        </section>

        <section id="product" className="lp-section lp-section--tight">
          <div className="lp-wrap lp-section-head-center">
            <h2 className="lp-h2">From markup to findings in a single workflow</h2>
            <p className="lp-lead">
              Developers paste source, QA reviews findings, leads export evidence. One console connects the full
              accessibility review cycle without switching tools.
            </p>
          </div>
          <div className="lp-wrap lp-dual-cards">
            <article
              className="lp-card lp-card--dark lp-card--law-feature"
              style={{ "--lp-law-bg": `url(${IMG_ACCESSIBILITY_LAW})` } as CSSProperties}
            >
              <span className="sr-only">
                Classic law library with leather-bound books on wooden shelves, a desk, and chairs—evoking legal codes
                and accessibility obligations.
              </span>
              <div className="lp-card-law-feature-stack">
                <div className="lp-card-law-feature-head">
                  <h3 className="lp-card-law-feature-title">Accessibility is a compliance obligation</h3>
                  <p className="lp-card-law-feature-tags" aria-hidden>
                    <span className="lp-card-law-tag">ADA</span>
                    <span className="lp-card-law-tag">WCAG</span>
                    <span className="lp-card-law-tag">Section 508</span>
                  </p>
                </div>
                <div className="lp-card-law-feature-body">
                  <p className="lp-card-body lp-card-body--law-tight">
                    Organizations shipping on Salesforce face ADA, Section 508, and EAA requirements. Static review
                    catches WCAG violations early so teams can remediate before governance checkpoints—not after.
                  </p>
                </div>
              </div>
            </article>
            <article className="lp-card lp-card--light">
              <h3 className="lp-card-title lp-card-title--dark">Paste, review, fix—then export the evidence</h3>
              <p className="lp-card-body lp-card-body--muted">
                Drop your LWC template into the console and run the analysis. Each finding shows the severity, affected
                line, WCAG criterion, and concrete steps to resolve it—so developers act on specifics, not guesswork.
              </p>
              <div className="lp-card-media">
                <img
                  className="lp-card-side-img"
                  src={IMG_CARD_SIDE}
                  alt="Team in a workshop with sticky notes on the wall and laptops on the table"
                  width={800}
                  height={533}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="lp-card-mock" aria-hidden>
                <div className="lp-mock-window">
                  <span className="lp-mock-dot" />
                  <span className="lp-mock-dot" />
                  <span className="lp-mock-dot" />
                  <div className="lp-mock-body">
                    <span className="lp-mock-line" />
                    <span className="lp-mock-line lp-mock-line--short" />
                    <span className="lp-mock-pill" />
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="lp-section" aria-labelledby="lp-score-title">
          <div className="lp-wrap lp-split-with-img">
            <div className="lp-split-copy">
              <h2 id="lp-score-title" className="lp-h2 lp-h2--left">
                Turn a score into an action plan your team can execute
              </h2>
              <p className="lp-lead lp-lead--right">
                Quality scores across accessibility, performance, best practices, and SEO give leads a snapshot; drill
                into individual findings to assign work at the component level.
              </p>
            </div>
            <div className="lp-split-img-wrap">
              <img
                className="lp-split-photo"
                src={IMG_SPLIT_PHOTO}
                alt="Person working on a laptop showing analytics and charts on screen"
                width={1024}
                height={741}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div className="lp-wrap lp-trio">
            <article className="lp-trio-card">
              <div className="lp-trio-icon" aria-hidden>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <h3 className="lp-trio-title">Shift accessibility left in your delivery pipeline</h3>
              <p className="lp-trio-body">
                Run checks during development—not after UAT. Static analysis on raw markup surfaces issues when the fix
                cost is lowest.
              </p>
            </article>
            <article className="lp-trio-card">
              <div className="lp-trio-icon" aria-hidden>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="lp-trio-title">Designed around Salesforce component patterns</h3>
              <p className="lp-trio-body">
                Checks understand Lightning-input labels, SLDS class conventions, Aura component structures, and LWC
                template semantics—not just generic HTML rules.
              </p>
            </article>
            <article className="lp-trio-card lp-trio-card--accent">
              <div className="lp-trio-icon" aria-hidden>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="lp-trio-title">Export-ready for governance and audit workflows</h3>
              <p className="lp-trio-body">
                JSON, Word, and PDF exports attach to release tickets and audit packages. Structured data means findings
                can feed dashboards or CI pipelines later.
              </p>
            </article>
          </div>
        </section>

        <section
          id="impact"
          className="lp-impact"
          aria-labelledby="lp-impact-title"
          style={{ "--lp-impact-photo": `url(${JSON.stringify(IMG_IMPACT_TEXTURE)})` } as CSSProperties}
        >
          <div className="lp-impact-texture" aria-hidden />
          <div className="lp-wrap lp-impact-inner">
            <p className="lp-impact-eyebrow">Why it matters to the business</p>
            <h2 id="lp-impact-title" className="lp-impact-title">
              Accessibility debt compounds faster than technical debt
            </h2>
            <div className="lp-impact-stats">
              <div className="lp-stat">
                <strong className="lp-stat-num">96%</strong>
                <span className="lp-stat-label">of top websites have detectable WCAG failures</span>
              </div>
              <div className="lp-stat">
                <strong className="lp-stat-num">4×</strong>
                <span className="lp-stat-label">cheaper to fix in code than after deployment</span>
              </div>
            </div>
            <p className="lp-impact-copy">
              Unresolved accessibility issues grow with every sprint. What starts as a missing label becomes a
              pattern copied across dozens of components, multiplying remediation effort at audit time. Static
              analysis catches these patterns at the template level—before they propagate through the codebase.
            </p>
            <p className="lp-impact-copy">
              Lightning A11y Lab gives Salesforce delivery teams a concrete starting point: paste markup, see
              findings, export evidence, and move forward with fixes prioritized by severity.
            </p>
          </div>
        </section>

        <section className="lp-section" aria-labelledby="lp-pillars-title">
          <div className="lp-wrap">
            <h2 id="lp-pillars-title" className="lp-h2 lp-h2--center">
              Three pillars of the review workflow
            </h2>
            <div className="lp-pillars">
              <article className="lp-pillar">
                <h3 className="lp-pillar-title">Static analysis at the template layer</h3>
                <ul className="lp-pillar-list">
                  <li>Checks run against raw LWC, Aura, and HTML markup—no browser or org required</li>
                  <li>Covers labels, headings, landmarks, ARIA roles, contrast, color-alone patterns, and more</li>
                  <li>Findings include line hints, snippets, and WCAG criterion references</li>
                </ul>
              </article>
              <article className="lp-pillar">
                <h3 className="lp-pillar-title">Structured export for governance</h3>
                <ul className="lp-pillar-list">
                  <li>JSON exports feed CI dashboards and automated tracking</li>
                  <li>Word and PDF reports attach to release tickets and audit evidence packages</li>
                  <li>Severity-ranked findings help teams prioritize work for sign-off deadlines</li>
                </ul>
              </article>
              <article className="lp-pillar">
                <h3 className="lp-pillar-title">Client-side by design</h3>
                <ul className="lp-pillar-list">
                  <li>All analysis runs in the browser—source code never leaves your machine</li>
                  <li>No account, no API key, and no backend dependency for the core review</li>
                  <li>Optionally connect external services for deeper analysis when your team is ready</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="team" className="lp-section lp-section--team" aria-labelledby="lp-team-title">
          <div className="lp-wrap">
            <div className="lp-section-head-center">
              <h2 id="lp-team-title" className="lp-h2 lp-h2--center">
                Team
              </h2>
              <p className="lp-lead lp-lead--center">
                The people behind LIGHTNING A11Y LAB—reach out for UX guidance or testing expertise.
              </p>
            </div>
            <ul className="lp-team-grid">
              {TEAM.map((member) => (
                <li key={member.email}>
                  <article className="lp-team-card">
                    <div className="lp-team-photo-wrap">
                      <img
                        className="lp-team-photo"
                        src={member.photo}
                        alt=""
                        width={280}
                        height={280}
                        decoding="async"
                      />
                    </div>
                    <h3 className="lp-team-name">{member.name}</h3>
                    <p className="lp-team-role">{member.role}</p>
                    <a className="lp-team-email" href={`mailto:${member.email}`}>
                      {member.email}
                    </a>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="faq" className="lp-section lp-section--faq" aria-labelledby={faqHeadingId}>
          <div className="lp-wrap lp-faq-grid">
            <div className="lp-faq-intro">
              <h2 className="lp-h2" id={faqHeadingId}>
                Frequently Asked Questions
              </h2>
              <p className="lp-faq-intro-text">
                Common questions about how the review console works and how to integrate it into your delivery process.
              </p>
            </div>
            <div className="lp-accordion">
              {FAQ_ITEMS.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div key={item.q} className={`lp-acc-item ${open ? "lp-acc-item--open" : ""}`}>
                    <button
                      type="button"
                      className="lp-acc-trigger"
                      aria-expanded={open}
                      aria-controls={`lp-acc-panel-${i}`}
                      id={`lp-acc-${i}`}
                      onClick={() => setOpenFaq(open ? null : i)}
                    >
                      <span className="lp-acc-q">{item.q}</span>
                      <span className="lp-acc-icon" aria-hidden>
                        {open ? "×" : "+"}
                      </span>
                    </button>
                    <div
                      id={`lp-acc-panel-${i}`}
                      role="region"
                      aria-labelledby={`lp-acc-${i}`}
                      className="lp-acc-panel"
                      hidden={!open}
                    >
                      <p className="lp-acc-a">{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="lp-prefooter" aria-labelledby="lp-prefooter-title">
          <div className="lp-wrap lp-prefooter-inner">
            <div className="lp-prefooter-copy">
              <h2 id="lp-prefooter-title" className="lp-prefooter-title">
                See where your markup stands on <em>accessibility</em> and <em>WCAG conformance</em>
              </h2>
              <p className="lp-prefooter-text">
                Paste a Lightning template, run the analysis, and get prioritized findings with concrete fix steps.
                No signup, no data uploaded—just results you can act on today.
              </p>
              <Link className="lp-btn lp-btn-white lp-btn-lg" to="/review">
                Start now
              </Link>
            </div>
            <div className="lp-prefooter-art" aria-hidden>
              <span className="lp-spark lp-spark--1" />
              <span className="lp-spark lp-spark--2" />
              <span className="lp-spark lp-spark--3" />
              <div className="lp-stack" />
            </div>
          </div>
        </section>

        <section className="lp-section lp-section--final-cta" aria-labelledby="lp-final-cta-title">
          <div className="lp-wrap lp-final-cta-inner">
            <h2 id="lp-final-cta-title" className="lp-final-cta-title">
              Fix accessibility issues in your markup <em>before</em> they reach production
            </h2>
            <p className="lp-final-cta-text">
              Every finding includes severity, the affected WCAG criterion, and step-by-step remediation—so your team
              ships with confidence.
            </p>
            <div className="lp-final-cta-row">
              <Link className="lp-btn lp-btn-primary lp-btn-lg" to="/review">
                Launch tool
              </Link>
              <Link className="lp-btn lp-btn-learn" to="/#product" preventScrollReset>
                Learn more
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
