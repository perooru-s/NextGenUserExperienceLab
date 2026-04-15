import type {
  Finding,
  FindingCategory,
  FindingSeverity,
  ReviewResult,
  WcagLevel,
  WcagRef,
  WcagVersion,
} from "../types";
import { analyzeInlineStylesContrast } from "./colors";
import { guides } from "./findingGuides";
import type { ExternalResource } from "../types";

let idCounter = 0;
function nextId(): string {
  return `f-${++idCounter}`;
}

function add(
  findings: Finding[],
  category: FindingCategory,
  severity: FindingSeverity,
  title: string,
  detail: string,
  opts?: {
    remediation?: string;
    snippet?: string;
    lineHint?: number;
    wcag?: WcagRef;
    importance?: string;
    fixSteps?: string[];
    resources?: ExternalResource[];
  }
): void {
  findings.push({
    id: nextId(),
    category,
    severity,
    title,
    detail,
    remediation: opts?.remediation,
    snippet: opts?.snippet,
    lineHint: opts?.lineHint,
    wcag: opts?.wcag,
    importance: opts?.importance,
    fixSteps: opts?.fixSteps,
    resources: opts?.resources,
  });
}

function wcagRank(level: WcagLevel): number {
  return level === "A" ? 1 : level === "AA" ? 2 : 3;
}

function includeForTarget(f: Finding, target: WcagLevel): boolean {
  if (!f.wcag) return true;
  return wcagRank(target) >= wcagRank(f.wcag.scope);
}

function lineOf(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

/** LWC template inner HTML and its start index in `source` (for accurate line numbers). */
function extractTemplateHtml(source: string): { inner: string; startOffset: number } {
  const open = source.search(/<template[\s>]/i);
  const close = source.lastIndexOf("</template>");
  if (open !== -1 && close !== -1 && close > open) {
    const start = source.indexOf(">", open) + 1;
    return { inner: source.slice(start, close), startOffset: start };
  }
  return { inner: source, startOffset: 0 };
}

export function analyzeSalesforceUI(
  rawSource: string,
  options: { wcagTarget?: WcagLevel; wcagVersion?: WcagVersion } = {}
): ReviewResult {
  const wcagTarget: WcagLevel = options.wcagTarget ?? "AA";
  const wcagVersion: WcagVersion = options.wcagVersion ?? "2.2";
  idCounter = 0;
  const findings: Finding[] = [];
  const source = rawSource.trim();
  const { inner: template, startOffset: templateStart } = extractTemplateHtml(source);
  const lower = template.toLowerCase();
  const lines = source.split("\n");

  if (!source) {
    add(findings, "ux", "info", "No source provided", "Paste LWC HTML, Aura markup, or mixed files to run checks.", {
      ...guides.generic,
    });
    return finalize(findings, 0, wcagTarget, wcagVersion);
  }

  // --- Accessibility: images ---
  const imgRe = /<img\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(template)) !== null) {
    const tag = m[0];
    const idx = m.index;
    if (!/\balt\s*=/.test(tag)) {
      add(
        findings,
        "a11y",
        "major",
        "Image missing alt text",
        "Screen readers need a meaningful alt (or alt=\"\" for decorative images).",
        {
          ...guides.imgMissingAlt,
          lineHint: lineOf(template, idx),
          remediation: 'Add alt="Description" or alt="" if decorative.',
          snippet: '<img src={url} alt="Customer profile photo" />',
          wcag: { scope: "A", criterion: "1.1.1 Non-text Content" },
        }
      );
    } else if (/alt\s*=\s*["']\s*["']/.test(tag)) {
      add(
        findings,
        "a11y",
        "minor",
        "Empty alt on image",
        "Confirm the image is decorative; otherwise provide descriptive alt text.",
        {
          ...guides.imgEmptyAlt,
          lineHint: lineOf(template, idx),
          wcag: { scope: "A", criterion: "1.1.1 Non-text Content" },
        }
      );
    }
  }

  // --- lightning-input without label ---
  const lightningInputRe = /<lightning-input\b[^>]*>/gi;
  while ((m = lightningInputRe.exec(template)) !== null) {
    const tag = m[0];
    const idx = m.index;
    if (!/\blabel\s*=/.test(tag) && !/\baria-label\s*=/.test(tag)) {
      add(
        findings,
        "a11y",
        "critical",
        "lightning-input missing label",
        "Inputs must expose an accessible name via label or aria-label.",
        {
          ...guides.lightningInputLabel,
          lineHint: lineOf(template, idx),
          remediation: "Use the label attribute or associate with lightning-input-field in a record edit form.",
          snippet: '<lightning-input label="Account Name" name="name" value={name} onchange={handleChange}></lightning-input>',
          wcag: { scope: "A", criterion: "1.3.1 Info and Relationships / 4.1.2 Name, Role, Value" },
        }
      );
    }
  }

  // --- lightning-textarea, lightning-combobox ---
  for (const el of ["lightning-textarea", "lightning-combobox", "lightning-dual-listbox", "lightning-radio-group"]) {
    const re = new RegExp(`<${el}\\b[^>]*>`, "gi");
    while ((m = re.exec(template)) !== null) {
      const tag = m[0];
      const idx = m.index;
      if (!/\blabel\s*=/.test(tag) && !/\baria-label\s*=/.test(tag)) {
        add(
          findings,
          "a11y",
          "major",
          `${el} missing label`,
          "Compound components still need a visible or aria label for assistive tech.",
          {
            ...guides.lightningCompoundLabel,
            lineHint: lineOf(template, idx),
            wcag: { scope: "A", criterion: "1.3.1 Info and Relationships / 4.1.2 Name, Role, Value" },
          }
        );
      }
    }
  }

  // --- lightning-button without label ---
  const btnRe = /<lightning-button\b[^>]*>/gi;
  while ((m = btnRe.exec(template)) !== null) {
    const tag = m[0];
    const idx = m.index;
    if (!/\blabel\s*=/.test(tag) && !/\baria-label\s*=/.test(tag)) {
      add(
        findings,
        "a11y",
        "major",
        "lightning-button missing label",
        "Buttons need an accessible name.",
        {
          ...guides.lightningButtonLabel,
          lineHint: lineOf(template, idx),
          snippet: '<lightning-button label="Save" variant="brand" onclick={handleSave}></lightning-button>',
          wcag: { scope: "A", criterion: "4.1.2 Name, Role, Value" },
        }
      );
    }
  }

  // --- Raw <button> with no text / aria ---
  const rawButtonRe = /<button\b[^>]*>([\s\S]*?)<\/button>/gi;
  while ((m = rawButtonRe.exec(template)) !== null) {
    const full = m[0];
    const inner = m[1].replace(/<[^>]+>/g, "").trim();
    const idx = m.index;
    if (!inner && !/\baria-label\s*=/.test(full) && !/\btitle\s*=/.test(full)) {
      add(
        findings,
        "a11y",
        "critical",
        "Button has no accessible name",
        "Icon-only or empty buttons need aria-label or visible text.",
        {
          ...guides.rawButtonName,
          lineHint: lineOf(template, idx),
          snippet: '<button type="button" aria-label="Close dialog" class="slds-button slds-button_icon">…</button>',
          wcag: { scope: "A", criterion: "4.1.2 Name, Role, Value" },
        }
      );
    }
  }

  // --- Div with onclick (anti-pattern) ---
  if (/\bonclick\s*=/.test(template) && /<div\b[^>]*\bonclick/i.test(template)) {
    const divOnclick = template.search(/<div\b[^>]*\bonclick/i);
    add(
      findings,
      "a11y",
      "major",
      "Click handler on non-interactive element",
      "Prefer <button> or lightning-button. If you use a div, add role, tabIndex, and keyboard handlers.",
      {
        ...guides.divClickKeyboard,
        lineHint: lineOf(template, divOnclick),
        remediation: "Replace with a button or add role=\"button\", tabindex=\"0\", onkeydown for Enter/Space.",
        wcag: { scope: "A", criterion: "2.1.1 Keyboard" },
      }
    );
  }

  // --- tabindex > 0 ---
  if (/\btabindex\s*=\s*["']?[1-9]/.test(template)) {
    add(
      findings,
      "a11y",
      "major",
      "Positive tabindex detected",
      "Positive tabindex disrupts natural focus order; prefer DOM order or tabindex=\"0\" only when necessary.",
      {
        ...guides.positiveTabindex,
        remediation: "Remove positive tabindex values and reorder markup instead.",
        wcag: { scope: "A", criterion: "2.4.3 Focus Order" },
      }
    );
  }

  // --- SLDS: encourage utility classes ---
  const hasSlds = /\bslds-/.test(template);
  if (template.includes("<div") && !hasSlds && template.length > 80) {
    add(
      findings,
      "slds",
      "minor",
      "Markup uses divs without SLDS classes",
      "Consider SLDS grid and spacing utilities (slds-grid, slds-col, slds-p-around_*) for consistency.",
      {
        ...guides.sldsDivs,
        remediation: "Align with SLDS layout patterns from the Lightning Design System.",
      }
    );
  }

  // --- lightning-card without title ---
  const cardRe = /<lightning-card\b[^>]*>/gi;
  while ((m = cardRe.exec(template)) !== null) {
    const tag = m[0];
    const idx = m.index;
    if (!/\btitle\s*=/.test(tag)) {
      add(
        findings,
        "ux",
        "minor",
        "lightning-card without title",
        "Card titles improve scanability and section hierarchy.",
        {
          ...guides.lightningCardTitle,
          lineHint: lineOf(template, idx),
          snippet: '<lightning-card title="Opportunity details" icon-name="standard:opportunity">',
        }
      );
    }
  }

  // --- Form field grouping / fieldset ---
  if (
    (lower.includes("radio") || lower.includes("checkbox")) &&
    !lower.includes("lightning-radio-group") &&
    !lower.includes("<fieldset") &&
    !lower.includes("role=\"group\"")
  ) {
    if (/<input[^>]*type\s*=\s*["']radio/i.test(template) || /<input[^>]*type\s*=\s*["']checkbox/i.test(template)) {
      add(
        findings,
        "ux",
        "minor",
        "Consider grouping related options",
        "Native radio/checkbox groups benefit from fieldset/legend or lightning-radio-group for labels and a11y.",
        {
          ...guides.formGrouping,
          wcag: { scope: "A", criterion: "1.3.1 Info and Relationships" },
        }
      );
    }
  }

  // --- Mobile: fixed widths ---
  if (/\bwidth\s*:\s*\d+px/.test(template) || /\bstyle\s*=\s*["'][^"']*width\s*:\s*\d+px/i.test(template)) {
    add(
      findings,
      "mobile",
      wcagTarget === "AAA" ? "major" : "minor",
      "Fixed pixel width in template",
      wcagTarget === "AAA"
        ? "At AAA, reflow and zoom expectations are stricter; fixed widths often break 320px / 400% zoom scenarios."
        : "Fixed widths can break small viewports and 320px-width reflow (WCAG 2.x AA). Prefer SLDS responsive grid or relative units.",
      {
        ...guides.reflowFixedWidth,
        wcag: { scope: "AA", criterion: "1.4.10 Reflow" },
      }
    );
  }

  // --- Mobile: touch targets (heuristic small buttons) ---
  if (/slds-button_icon-small|slds-button--small/.test(lower)) {
    if (wcagTarget === "AAA") {
      add(
        findings,
        "mobile",
        "major",
        "Small control variant — verify AAA target size",
        "WCAG 2.5.5 (Enhanced) expects roughly 44×44 CSS px for pointer targets unless an equivalent exception applies.",
        {
          ...guides.targetSizeAAA,
          wcag: { scope: "AAA", criterion: "2.5.5 Target Size (Enhanced)" },
        }
      );
    } else if (wcagTarget === "AA") {
      if (wcagVersion === "2.2") {
        add(
          findings,
          "mobile",
          "minor",
          "Small control variant — verify AA target size (WCAG 2.2)",
          "WCAG 2.2 AA 2.5.8 Target Size (Minimum) requires at least 24×24 CSS px (with exceptions). Icon-only controls often need padding or a larger hit area.",
          {
            ...guides.targetSizeAA22,
            wcag: { scope: "AA", criterion: "2.5.8 Target Size (Minimum) (2.2)" },
          }
        );
      } else {
        add(
          findings,
          "mobile",
          "minor",
          "Small control variant — pointer target size",
          "WCAG 2.1 has no AA Success Criterion for minimum target size. AAA 2.5.5 (44×44 CSS px) is the closest normative bar; many teams still aim for ≥24×24 as best practice.",
          {
            ...guides.targetSize21,
            wcag: { scope: "AA", criterion: "2.5.5 (AAA) — practice guidance for AA intent" },
          }
        );
      }
    }
  }

  // --- Inline style contrast (hex / rgb in style attributes) ---
  const contrastIssues = analyzeInlineStylesContrast(template, templateStart, (g) => lineOf(source, g), wcagTarget);
  for (const c of contrastIssues) {
    add(findings, "a11y", c.severity, c.title, c.detail, {
      remediation: c.remediation,
      lineHint: c.lineHint,
      wcag: c.wcag,
      importance: c.importance,
      fixSteps: c.fixSteps,
      resources: c.resources,
    });
  }

  // --- Aura: ui:input without label ---
  if (/ui:inputText|ui:inputNumber|ui:inputDate/i.test(source)) {
    if (!/label|aria-label/i.test(source)) {
      add(
        findings,
        "a11y",
        "major",
        "Aura input may lack label",
        "Verify ui:input* components have label or aura:id paired with ui:outputLabel.",
        {
          ...guides.auraInputLabel,
          wcag: { scope: "A", criterion: "1.3.1 / 3.3.2 / 4.1.2" },
        }
      );
    }
  }

  // --- Heading hierarchy: skipped levels + multiple h1 ---
  {
    const headingRe = /<h([1-6])\b/gi;
    const levels: { level: number; idx: number }[] = [];
    let hm: RegExpExecArray | null;
    while ((hm = headingRe.exec(template)) !== null) {
      levels.push({ level: Number(hm[1]), idx: hm.index });
    }
    let h1Count = 0;
    for (let i = 0; i < levels.length; i++) {
      if (levels[i].level === 1) h1Count++;
      if (i > 0 && levels[i].level - levels[i - 1].level > 1) {
        add(
          findings,
          "a11y",
          "major",
          `Heading level skipped (h${levels[i - 1].level} → h${levels[i].level})`,
          `Headings jump from h${levels[i - 1].level} to h${levels[i].level}, skipping h${levels[i - 1].level + 1}. Screen readers use heading hierarchy to build a page outline.`,
          {
            ...guides.headingHierarchy,
            lineHint: lineOf(template, levels[i].idx),
            remediation: `Insert an h${levels[i - 1].level + 1} between h${levels[i - 1].level} and h${levels[i].level}, or adjust levels to follow sequential order.`,
            wcag: { scope: "A", criterion: "1.3.1 Info and Relationships" },
          }
        );
      }
    }
    if (h1Count > 1) {
      add(
        findings,
        "a11y",
        "major",
        `Multiple h1 elements (${h1Count} found)`,
        "A page should have a single h1 that identifies its primary topic. Multiple h1 elements dilute the outline and confuse screen reader navigation.",
        {
          ...guides.headingMultipleH1,
          remediation: "Keep one h1 and demote others to h2 or lower.",
          wcag: { scope: "A", criterion: "1.3.1 Info and Relationships" },
        }
      );
    }
  }

  // --- Landmarks: missing semantic regions ---
  {
    const hasLandmark =
      /<(main|nav|header|footer|aside)\b/i.test(template) ||
      /<section\b[^>]*\baria-label/i.test(template) ||
      /\brole\s*=\s*["'](navigation|banner|main|contentinfo|complementary|search)["']/i.test(template);
    if (!hasLandmark && template.length > 200) {
      add(
        findings,
        "a11y",
        "minor",
        "No landmark regions detected",
        "Landmark elements (main, nav, header, footer, aside) help assistive technology users navigate between page sections efficiently.",
        {
          ...guides.landmarksMissing,
          remediation: "Wrap primary content in <main>, navigation in <nav>, and use <header>/<footer> where appropriate.",
          snippet: '<main>\n  <!-- primary content -->\n</main>',
          wcag: { scope: "A", criterion: "1.3.1 Info and Relationships" },
        }
      );
    }
  }

  // --- ARIA role validation: invalid roles + presentation on focusable ---
  {
    const VALID_ARIA_ROLES = new Set([
      "alert", "alertdialog", "application", "article", "banner", "blockquote", "button",
      "caption", "cell", "checkbox", "code", "columnheader", "combobox", "command",
      "complementary", "composite", "contentinfo", "definition", "deletion", "dialog",
      "directory", "document", "emphasis", "feed", "figure", "form", "generic", "grid",
      "gridcell", "group", "heading", "img", "input", "insertion", "landmark", "link",
      "list", "listbox", "listitem", "log", "main", "mark", "marquee", "math", "menu",
      "menubar", "menuitem", "menuitemcheckbox", "menuitemradio", "meter", "navigation",
      "none", "note", "option", "paragraph", "presentation", "progressbar", "radio",
      "radiogroup", "range", "region", "roletype", "row", "rowgroup", "rowheader",
      "scrollbar", "search", "searchbox", "section", "sectionhead", "select", "separator",
      "slider", "spinbutton", "status", "strong", "structure", "subscript", "superscript",
      "switch", "tab", "table", "tablist", "tabpanel", "term", "textbox", "timer",
      "toolbar", "tooltip", "tree", "treegrid", "treeitem", "widget", "window",
    ]);
    const roleRe = /\brole\s*=\s*["']([^"']+)["']/gi;
    let rm: RegExpExecArray | null;
    while ((rm = roleRe.exec(template)) !== null) {
      const roleValue = rm[1].trim().toLowerCase();
      const tagContext = template.slice(Math.max(0, rm.index - 120), rm.index + rm[0].length + 10);
      if (!VALID_ARIA_ROLES.has(roleValue)) {
        add(
          findings,
          "a11y",
          "major",
          `Invalid ARIA role: "${rm[1].trim()}"`,
          `"${rm[1].trim()}" is not a recognized WAI-ARIA role. Assistive technology may ignore this element entirely.`,
          {
            ...guides.ariaRoleInvalid,
            lineHint: lineOf(template, rm.index),
            remediation: `Replace with a valid ARIA role (e.g. role="button", role="dialog") or remove the attribute.`,
            wcag: { scope: "A", criterion: "4.1.2 Name, Role, Value" },
          }
        );
      } else if (roleValue === "presentation" || roleValue === "none") {
        const isFocusable =
          /\bonclick\b/i.test(tagContext) ||
          /\bhref\s*=/i.test(tagContext) ||
          /\btabindex\s*=\s*["']?(?!-1)\d/i.test(tagContext) ||
          /<(?:button|a|input|select|textarea)\b/i.test(tagContext);
        if (isFocusable) {
          add(
            findings,
            "a11y",
            "major",
            `role="${roleValue}" on interactive element`,
            `role="${roleValue}" removes the element from the accessibility tree, but it appears to be interactive (has click handler, href, or tabindex). This hides it from assistive technology users.`,
            {
              ...guides.ariaRolePresentationOnFocusable,
              lineHint: lineOf(template, rm.index),
              remediation: `Remove role="${roleValue}" from interactive elements, or remove the interactive behavior if the element should be inert.`,
              wcag: { scope: "A", criterion: "4.1.2 Name, Role, Value" },
            }
          );
        }
      }
    }
  }

  // --- Form required/error patterns ---
  {
    const lightningInputReqRe = /<lightning-input\b[^>]*\brequired\b[^>]*>/gi;
    let fm: RegExpExecArray | null;
    while ((fm = lightningInputReqRe.exec(template)) !== null) {
      const tag = fm[0];
      if (!/\bmessage-when-/.test(tag)) {
        add(
          findings,
          "a11y",
          "minor",
          "Required lightning-input without error messages",
          "lightning-input has required but no message-when-* attributes. Custom error text helps users understand what went wrong.",
          {
            ...guides.formErrorRequired,
            lineHint: lineOf(template, fm.index),
            remediation: 'Add message-when-value-missing="Please fill in this field" (and other message-when-* as needed).',
            snippet: '<lightning-input label="Email" required message-when-value-missing="Email is required"></lightning-input>',
            wcag: { scope: "A", criterion: "3.3.1 Error Identification / 3.3.2 Labels or Instructions" },
          }
        );
      }
    }

    const nativeReqRe = /<(?:input|select|textarea)\b[^>]*\brequired\b[^>]*>/gi;
    while ((fm = nativeReqRe.exec(template)) !== null) {
      const tag = fm[0];
      if (!/\baria-describedby\s*=/.test(tag) && !/\baria-errormessage\s*=/.test(tag)) {
        add(
          findings,
          "a11y",
          "minor",
          "Required field without error announcement",
          "This required input has no aria-describedby or aria-errormessage attribute. Screen reader users may not hear validation errors.",
          {
            ...guides.formErrorRequired,
            lineHint: lineOf(template, fm.index),
            remediation: 'Add aria-describedby pointing to an error message container, or use aria-errormessage.',
            snippet: '<input required aria-describedby="email-error" />\n<span id="email-error" role="alert"></span>',
            wcag: { scope: "A", criterion: "3.3.1 Error Identification / 3.3.2 Labels or Instructions" },
          }
        );
      }
    }
  }

  // --- Color alone: semantic colors without secondary indicator ---
  {
    const semanticColorNames = /\bcolor\s*:\s*(red|green|orange|darkred|darkgreen|crimson|firebrick|forestgreen|limegreen)\b/gi;
    const semanticHex = /\bcolor\s*:\s*#(ff0000|f00|00ff00|0f0|ff4500|cc0000|008000|dc143c|b22222|228b22|32cd32)\b/gi;
    const sldsColorClasses = /\bslds-text-color_(error|success|warning)\b/gi;

    const checkNearbyIndicator = (pos: number): boolean => {
      const vicinity = template.slice(Math.max(0, pos - 200), Math.min(template.length, pos + 200));
      return /lightning-icon|<svg\b|slds-icon|\baria-label\s*=/.test(vicinity);
    };

    let cm: RegExpExecArray | null;
    const colorAlonePositions = new Set<number>();

    while ((cm = semanticColorNames.exec(template)) !== null) {
      if (!checkNearbyIndicator(cm.index) && !colorAlonePositions.has(lineOf(template, cm.index))) {
        colorAlonePositions.add(lineOf(template, cm.index));
        add(
          findings,
          "a11y",
          "minor",
          `Color alone may convey meaning (${cm[1]})`,
          `The color "${cm[1]}" is often used for status or error states. Ensure a secondary indicator (icon, text label, pattern) accompanies the color.`,
          {
            ...guides.colorAlone,
            lineHint: lineOf(template, cm.index),
            remediation: "Add an icon, text label, or visual pattern alongside color to convey meaning.",
            wcag: { scope: "A", criterion: "1.4.1 Use of Color" },
          }
        );
      }
    }

    while ((cm = semanticHex.exec(template)) !== null) {
      if (!checkNearbyIndicator(cm.index) && !colorAlonePositions.has(lineOf(template, cm.index))) {
        colorAlonePositions.add(lineOf(template, cm.index));
        add(
          findings,
          "a11y",
          "minor",
          "Color alone may convey meaning (semantic hex)",
          "This inline style uses a color commonly associated with status (red, green, orange). Ensure a secondary indicator accompanies the color.",
          {
            ...guides.colorAlone,
            lineHint: lineOf(template, cm.index),
            remediation: "Add an icon, text label, or visual pattern alongside color to convey meaning.",
            wcag: { scope: "A", criterion: "1.4.1 Use of Color" },
          }
        );
      }
    }

    while ((cm = sldsColorClasses.exec(template)) !== null) {
      if (!checkNearbyIndicator(cm.index)) {
        add(
          findings,
          "a11y",
          "minor",
          `SLDS status color class without secondary indicator (${cm[1]})`,
          `slds-text-color_${cm[1]} conveys meaning through color. Pair it with an icon or text label so color-blind users get the same information.`,
          {
            ...guides.colorAlone,
            lineHint: lineOf(template, cm.index),
            remediation: "Add a lightning-icon or text prefix (e.g. \"Error: …\") alongside the color class.",
            wcag: { scope: "A", criterion: "1.4.1 Use of Color" },
          }
        );
      }
    }
  }

  // --- Modal/overlay focus management reminders ---
  {
    const hasModal =
      /\blightning-modal\b/i.test(template) ||
      /\bslds-modal\b/i.test(template) ||
      /\brole\s*=\s*["']dialog["']/i.test(template) ||
      /\baria-modal\s*=\s*["']true["']/i.test(template) ||
      /<dialog\b/i.test(template);
    if (hasModal) {
      add(
        findings,
        "ux",
        "info",
        "Modal detected — verify focus management at runtime",
        "Static analysis found a modal or dialog pattern. Verify these three behaviors in the running application: (1) focus is trapped inside the modal while open, (2) pressing Escape closes the modal, (3) focus returns to the triggering element after the modal closes.",
        {
          ...guides.modalFocusManagement,
          wcag: { scope: "A", criterion: "2.4.3 Focus Order" },
        }
      );
    }
  }

  // --- Positive signals ---
  if (/\blightning-helptext\b/i.test(template)) {
    add(findings, "ux", "info", "Help text component detected", "lightning-helptext supports contextual guidance—good pattern.", {
      ...guides.helptextPositive,
    });
  }
  if (/\blightning-formatted-rich-text\b/i.test(template)) {
    add(
      findings,
      "a11y",
      "info",
      "Rich text component in use",
      "Ensure user-supplied HTML is sanitized server-side; review output for heading order and links.",
      {
        ...guides.richTextSanitize,
        wcag: { scope: "A", criterion: "1.3.1 Info and Relationships" },
      }
    );
  }

  // --- Level-specific manual checks (code cannot prove contrast / motion / audio) ---
  if (wcagTarget === "AA" || wcagTarget === "AAA") {
    add(
      findings,
      "a11y",
      "info",
      "Manual check: contrast (AA)",
      wcagVersion === "2.2"
        ? "Inline styles are partially checked above when colors are parseable. Still verify 1.4.3 / 1.4.11 in real themes, images, and states (hover/focus/disabled)."
        : "Inline styles are partially checked when colors are parseable. For WCAG 2.1 AA, verify 1.4.3 Contrast (Minimum) and 1.4.11 Non-text Contrast in the running UI.",
      {
        ...guides.manualContrast,
        wcag: { scope: "AA", criterion: "1.4.3 / 1.4.11" },
      }
    );
  }
  if (wcagTarget === "AAA") {
    add(
      findings,
      "a11y",
      "info",
      "Manual check: enhanced contrast (AAA)",
      "For AAA, verify 1.4.6 Contrast (Enhanced): roughly 7:1 for normal text and 4.5:1 for large text where applicable.",
      {
        ...guides.manualContrastAAA,
        wcag: { scope: "AAA", criterion: "1.4.6 Contrast (Enhanced)" },
      }
    );
  }

  if (wcagVersion === "2.2" && (wcagTarget === "AA" || wcagTarget === "AAA")) {
    add(
      findings,
      "a11y",
      "info",
      "WCAG 2.2-only: focus & dragging (manual)",
      "In a live app, verify 2.4.11 Focus Not Obscured (Minimum), 2.4.13 Focus Appearance, and 2.5.7 Dragging Movements where relevant — not detectable from static HTML alone.",
      {
        ...guides.wcag22FocusDragging,
        wcag: { scope: "AA", criterion: "2.4.11 / 2.4.13 / 2.5.7 (2.2)" },
      }
    );
  }

  return finalize(findings, lines.length, wcagTarget, wcagVersion);
}

function finalize(
  findings: Finding[],
  lineCount: number,
  wcagTarget: WcagLevel,
  wcagVersion: WcagVersion
): ReviewResult {
  const visible = findings.filter((f) => includeForTarget(f, wcagTarget));
  const summary = { critical: 0, major: 0, minor: 0, info: 0 };
  for (const f of visible) {
    summary[f.severity]++;
  }
  return {
    findings: visible.sort((a, b) => {
      const order = { critical: 0, major: 1, minor: 2, info: 3 };
      return order[a.severity] - order[b.severity];
    }),
    summary,
    meta: {
      analyzedAt: new Date().toISOString(),
      lineCount,
      wcagTarget,
      wcagVersion,
    },
  };
}
