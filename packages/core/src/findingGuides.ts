import type { ExternalResource } from "./types.js";

/** WCAG 2.2 Understanding documents (primary reference for criteria). */
const U22 = "https://www.w3.org/WAI/WCAG22/Understanding";

/** WCAG 2.1 Understanding (when behavior overlaps). */
const U21 = "https://www.w3.org/WAI/WCAG21/Understanding";

export const LINKS = {
  mdnImgAlt: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#alternative_text",
  mdnButtonA11y: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#accessibility",
  mdnKeyboardNav: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets",
  mdnContrast: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Color_contrast",
  mdnAriaName: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label",
  mdnHeadings: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements",
  mdnAriaRoles: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles",
  waiEasyChecks: "https://www.w3.org/WAI/test-evaluate/easy-checks/",
  waiLandmarks: "https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/",
  waiAriaRoles: "https://www.w3.org/TR/wai-aria-1.2/#role_definitions",
  waiDialogPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
  sldsA11y: "https://www.lightningdesignsystem.com/accessibility/overview/",
  sldsModal: "https://www.lightningdesignsystem.com/components/modals/",
  sldsPageLayout: "https://www.lightningdesignsystem.com/components/page-headers/",
  lwcGuide: "https://developer.salesforce.com/docs/platform/lwc/guide",
  lwcA11y:
    "https://developer.salesforce.com/docs/component-library/documentation/en/lwc/create_components_accessibility",
  lwcInput: "https://developer.salesforce.com/docs/component-library/bundle/lightning-input/specification",
  sfProductA11y: "https://www.salesforce.com/company/legal/compliance/",
  trailheadA11y: "https://trailhead.salesforce.com/content/learn/modules/web-accessibility",
} as const;

function u22(slug: string): ExternalResource {
  return { label: `WCAG 2.2: ${slug.replace(/-/g, " ")}`, href: `${U22}/${slug}.html` };
}

function u21(slug: string): ExternalResource {
  return { label: `WCAG 2.1: ${slug.replace(/-/g, " ")}`, href: `${U21}/${slug}.html` };
}

export type FindingGuide = {
  importance: string;
  fixSteps: string[];
  resources: ExternalResource[];
};

export const guides = {
  imgMissingAlt: {
    importance:
      "Without alt text, screen reader users cannot understand informative images; decorative images should explicitly use empty alt so assistive tech skips them. This drives UAT defects, legal risk under accessibility regulations, and poor adoption among users who rely on assistive technology.",
    fixSteps: [
      "Decide if the image conveys meaning. If yes, write concise alt text describing purpose (not file names).",
      'If purely decorative, use alt="" so the image is ignored by screen readers.',
      "For LWC, bind alt to a descriptive string or use lightning-formatted-rich-text only when appropriate.",
      "Retest with a screen reader (NVDA/VoiceOver) or Salesforce Accessibility tools in a sandbox.",
    ],
    resources: [
      u22("non-text-content"),
      u21("non-text-content"),
      { label: "MDN: Image alt text", href: LINKS.mdnImgAlt },
      { label: "SLDS: Accessibility overview", href: LINKS.sldsA11y },
    ],
  } satisfies FindingGuide,

  imgEmptyAlt: {
    importance:
      "Empty alt is correct only for decorative images. If the image carries meaning, users who cannot see it lose context—often caught late in QA.",
    fixSteps: [
      "Confirm with design/content whether the image is decorative.",
      "If it carries meaning, replace with descriptive alt text.",
      "If decorative, keep alt=\"\" and ensure no critical information is image-only.",
    ],
    resources: [u22("non-text-content"), { label: "WAI: Easy Checks", href: LINKS.waiEasyChecks }],
  } satisfies FindingGuide,

  lightningInputLabel: {
    importance:
      "Unlabeled inputs break form completion for screen reader users and violate name/relationship requirements. In Salesforce delivery, this surfaces as accessibility audit failures and blocks enterprise WCAG sign-off.",
    fixSteps: [
      "Add a visible label via the `label` attribute on lightning-input (preferred).",
      "If a visible label is not possible, set `aria-label` with a clear name matching visible wording (2.5.3 Label in Name).",
      "In record forms, prefer lightning-record-edit-form + lightning-input-field for automatic label association.",
      "Verify in the live org with keyboard Tab and a screen reader.",
    ],
    resources: [
      u22("labels-or-instructions"),
      u22("name-role-value"),
      u21("info-and-relationships"),
      { label: "LWC: Accessible components", href: LINKS.lwcA11y },
      { label: "SLDS: Accessibility", href: LINKS.sldsA11y },
    ],
  } satisfies FindingGuide,

  lightningCompoundLabel: {
    importance:
      "Compound Lightning components still expose a single control to assistive APIs; without a name, users cannot identify the field purpose.",
    fixSteps: [
      "Set `label` (or `aria-label` when appropriate) on lightning-textarea, lightning-combobox, lightning-dual-listbox, lightning-radio-group.",
      "Group related radios with a single question label via lightning-radio-group's label.",
      "Cross-check against SLDS form patterns in the Lightning Design System.",
    ],
    resources: [
      u22("name-role-value"),
      u22("labels-or-instructions"),
      { label: "LWC developer guide", href: LINKS.lwcGuide },
      { label: "SLDS: Accessibility", href: LINKS.sldsA11y },
    ],
  } satisfies FindingGuide,

  lightningButtonLabel: {
    importance:
      "Buttons without names appear as \u201cbutton\u201d with no action\u2014blocking task completion for assistive tech users and failing 4.1.2 in audits.",
    fixSteps: [
      "Set the `label` attribute on lightning-button.",
      "For icon-only patterns, use lightning-button-icon with `alternative-text` or a visible text label.",
      "Ensure the programmatic name includes the same words users see (Label in Name).",
    ],
    resources: [
      u22("name-role-value"),
      { label: "MDN: button accessibility", href: LINKS.mdnButtonA11y },
      { label: "LWC: Accessible components", href: LINKS.lwcA11y },
    ],
  } satisfies FindingGuide,

  rawButtonName: {
    importance:
      "Icon-only or empty buttons are unusable for voice control and screen readers; they are a top source of critical audit findings.",
    fixSteps: [
      "Prefer visible text inside the button.",
      "If icon-only, add aria-label (and often title only as supplement, not replacement).",
      "Use lightning-button-icon with alternative-text in LWC where possible.",
    ],
    resources: [
      u22("name-role-value"),
      { label: "MDN: aria-label", href: LINKS.mdnAriaName },
      { label: "SLDS: Accessibility", href: LINKS.sldsA11y },
    ],
  } satisfies FindingGuide,

  divClickKeyboard: {
    importance:
      "Mouse-only interactions exclude keyboard and switch users and fail keyboard operability requirements\u2014common in custom LWC layouts.",
    fixSteps: [
      "Replace clickable divs with lightning-button or native <button type=\"button\">.",
      "If you must keep a custom element, add role=\"button\", tabindex=\"0\", and keyboard handlers for Enter and Space.",
      "Verify focus ring visibility and tab order in the running app.",
    ],
    resources: [
      u22("keyboard"),
      u21("keyboard"),
      { label: "MDN: Keyboard-navigable widgets", href: LINKS.mdnKeyboardNav },
      { label: "Trailhead: Web accessibility", href: LINKS.trailheadA11y },
    ],
  } satisfies FindingGuide,

  positiveTabindex: {
    importance:
      "Positive tabindex values override natural reading order, confusing screen reader and keyboard users and breaking predictable focus flow.",
    fixSteps: [
      "Remove tabindex greater than 0.",
      "Reorder DOM or use CSS for visual order; use tabindex=\"0\" only when making a custom focusable control.",
      "Retest focus order with Tab / Shift+Tab.",
    ],
    resources: [u22("focus-order"), u21("focus-order"), { label: "WAI: Easy Checks", href: LINKS.waiEasyChecks }],
  } satisfies FindingGuide,

  sldsDivs: {
    importance:
      "Consistent SLDS layout reduces visual bugs, speeds UAT, and aligns with Salesforce UX expectations across clouds and mobile.",
    fixSteps: [
      "Refactor ad-hoc divs to slds-grid, slds-col, and spacing utilities.",
      "Reference SLDS blueprint patterns for cards, forms, and data tables.",
      "Review with design on spacing scale (small/medium/large) for density.",
    ],
    resources: [
      { label: "Lightning Design System", href: "https://www.lightningdesignsystem.com/" },
      { label: "SLDS: Grid", href: "https://www.lightningdesignsystem.com/utilities/grid/" },
    ],
  } satisfies FindingGuide,

  lightningCardTitle: {
    importance:
      "Card titles create a clear information scent for all users and help assistive tech users navigate by headings/landmarks in complex pages.",
    fixSteps: [
      "Set `title` on lightning-card (and optional icon-name for recognition).",
      "Ensure the title reflects the primary task or entity in the card.",
    ],
    resources: [
      u22("info-and-relationships"),
      { label: "SLDS: Cards", href: "https://www.lightningdesignsystem.com/components/cards/" },
    ],
  } satisfies FindingGuide,

  formGrouping: {
    importance:
      "Grouped controls without a shared legend confuse screen reader users about which options belong together, increasing errors in forms.",
    fixSteps: [
      "Use lightning-radio-group or lightning-checkbox-group with a clear label.",
      "For native HTML, wrap in <fieldset> with <legend>.",
      "Avoid orphan radio buttons without a group label.",
    ],
    resources: [u22("info-and-relationships"), u22("labels-or-instructions"), { label: "LWC: Accessible components", href: LINKS.lwcA11y }],
  } satisfies FindingGuide,

  reflowFixedWidth: {
    importance:
      "Fixed widths break reflow at 320px CSS width and zoom, blocking mobile and low-vision users\u2014often a hard AA failure in WCAG audits.",
    fixSteps: [
      "Replace fixed pixel widths with SLDS grid, flex, or percentage/max-width patterns.",
      "Test at 320px width and 200% / 400% browser zoom on real content.",
      "Avoid horizontal scrolling for whole-page reflow where AA requires vertical stacking.",
    ],
    resources: [u22("reflow"), u21("reflow"), { label: "SLDS: Utilities", href: "https://www.lightningdesignsystem.com/utilities/" }],
  } satisfies FindingGuide,

  targetSizeAAA: {
    importance:
      "Small targets increase mis-taps and task time on mobile; AAA 2.5.5 is required only when you claim AAA conformance but is a strong UX bar for field-heavy apps.",
    fixSteps: [
      "Increase padding or use default-size SLDS buttons for primary actions.",
      "Ensure spacing between adjacent targets to reduce accidental activation.",
      "Verify touch size in Chrome device mode and on physical devices.",
    ],
    resources: [u22("target-size-enhanced"), u21("target-size-enhanced")],
  } satisfies FindingGuide,

  targetSizeAA22: {
    importance:
      "WCAG 2.2 AA 2.5.8 reduces accidental taps and helps motor-impaired users; many enterprise RFPs now reference WCAG 2.2.",
    fixSteps: [
      "Aim for at least 24\u00d724 CSS pixels for the clickable area (including padding), unless an exception applies.",
      "Prefer standard icon buttons with adequate hit targets over icon-small for primary flows.",
      "Document any exceptions (inline text link, equivalent control, etc.) for audit evidence.",
    ],
    resources: [u22("target-size-minimum")],
  } satisfies FindingGuide,

  targetSize21: {
    importance:
      "WCAG 2.1 does not define an AA minimum target size, but small controls still cause production UX issues and may fail internal design standards.",
    fixSteps: [
      "Treat AAA 2.5.5 (44\u00d744) or 2.2\u2019s 2.5.8 (24\u00d724) as a practical target when planning upgrades.",
      "Prioritize primary actions on mobile with larger targets.",
    ],
    resources: [u21("target-size-enhanced"), u22("target-size-minimum")],
  } satisfies FindingGuide,

  contrastText: {
    importance:
      "Low contrast text excludes users with low vision and cognitive load constraints; it is one of the most common automated WCAG failures in enterprise apps.",
    fixSteps: [
      "Adjust foreground/background to meet required ratio (AA: 4.5:1 normal / 3:1 large; AAA stricter).",
      "Prefer SLDS design tokens and brand-approved colors checked against your theme.",
      "Re-verify on real Lightning backgrounds (card, modal, app header), not only isolated hex pairs.",
    ],
    resources: [
      u22("contrast-minimum"),
      u22("contrast-enhanced"),
      { label: "MDN: Color contrast", href: LINKS.mdnContrast },
      { label: "WAI: Easy Checks (contrast)", href: LINKS.waiEasyChecks },
    ],
  } satisfies FindingGuide,

  contrastNonText: {
    importance:
      "UI boundaries (borders, icons, focus rings) that disappear against adjacent colors break 1.4.11 and make controls hard to find for many users.",
    fixSteps: [
      "Increase contrast between border and fill to at least 3:1 for active UI components.",
      "Use SLDS borders and states designed for accessible non-text contrast.",
      "Check default, hover, focus, and error states\u2014not only static markup.",
    ],
    resources: [u22("non-text-contrast"), u21("non-text-contrast"), { label: "SLDS: Accessibility", href: LINKS.sldsA11y }],
  } satisfies FindingGuide,

  auraInputLabel: {
    importance:
      "Aura apps still require programmatic names for inputs; unlabeled fields fail audits and block keyboard/screen reader task flows.",
    fixSteps: [
      "Pair ui:input* with ui:outputLabel via aura:id or use the label attribute where supported.",
      "Migrate complex UIs to LWC + lightning-* for clearer accessibility APIs when possible.",
      "Validate in Aura runtime with accessibility tree inspection.",
    ],
    resources: [
      u22("labels-or-instructions"),
      { label: "Aura components (developer docs)", href: "https://developer.salesforce.com/docs/atlas.en-us.auraapi.meta/auraapi/" },
      { label: "LWC migration guide", href: "https://developer.salesforce.com/docs/platform/lwc/guide/migrate-aura.html" },
    ],
  } satisfies FindingGuide,

  richTextSanitize: {
    importance:
      "Unsanitized rich text can inject unsafe markup, break heading structure, and create confusing or inaccessible content for assistive tech.",
    fixSteps: [
      "Sanitize user HTML server-side or with a trusted library before render.",
      "Preserve logical heading order (h1\u2192h2\u2192h3) inside rich content.",
      "Ensure links have descriptive text, not \u201cclick here\u201d.",
    ],
    resources: [
      u22("info-and-relationships"),
      { label: "MDN: Accessibility", href: "https://developer.mozilla.org/en-US/docs/Web/Accessibility" },
    ],
  } satisfies FindingGuide,

  manualContrast: {
    importance:
      "Automated checks cannot see theme variables, images of text, or all states; manual contrast verification prevents late UAT surprises.",
    fixSteps: [
      "Run contrast checks in the org with a browser extension or design tool on real components.",
      "Include hover, focus, selected, disabled, and error states.",
      "Log evidence (screenshots + ratio) for WCAG conformance documentation.",
    ],
    resources: [
      u22("contrast-minimum"),
      u22("non-text-contrast"),
      { label: "WAI: Easy Checks", href: LINKS.waiEasyChecks },
    ],
  } satisfies FindingGuide,

  manualContrastAAA: {
    importance:
      "AAA contrast is stricter; claiming AAA (even partially) requires evidence that enhanced ratios are met in production themes.",
    fixSteps: [
      "Measure 7:1 for normal text and 4.5:1 for large text where 1.4.6 applies.",
      "Prioritize high-impact surfaces: body copy, primary actions, error text.",
    ],
    resources: [u22("contrast-enhanced"), { label: "MDN: Color contrast", href: LINKS.mdnContrast }],
  } satisfies FindingGuide,

  wcag22FocusDragging: {
    importance:
      "WCAG 2.2 adds focus visibility and obscuring rules; failures are UX and compliance gaps for keyboard users in modals, sticky headers, and custom drag UIs.",
    fixSteps: [
      "Test that focus indicators are visible and not hidden by sticky bars or modals.",
      "Provide keyboard alternatives where drag-and-drop is required.",
      "Review 2.4.11, 2.4.13, and 2.5.7 Understanding docs with your QA checklist.",
    ],
    resources: [
      u22("focus-not-obscured-minimum"),
      u22("focus-appearance"),
      u22("dragging-movements"),
    ],
  } satisfies FindingGuide,

  screenshotReview: {
    importance:
      "Visual review catches alignment, density, and contrast in context\u2014things static code analysis misses\u2014reducing design debt before release.",
    fixSteps: [
      "Compare desktop and mobile breakpoints against SLDS patterns.",
      "Pair screenshots with keyboard-only and 200% zoom passes.",
      "Optionally plug in a vision model for contrast/layout hints in a future iteration.",
    ],
    resources: [
      { label: "WAI: Easy Checks", href: LINKS.waiEasyChecks },
      { label: "SLDS: Accessibility", href: LINKS.sldsA11y },
    ],
  } satisfies FindingGuide,

  helptextPositive: {
    importance:
      "Contextual help reduces support load and form errors; keeping it accessible benefits all users.",
    fixSteps: ["Continue using lightning-helptext for field-level guidance.", "Keep help concise and associated with the correct input."],
    resources: [{ label: "SLDS: Forms", href: "https://www.lightningdesignsystem.com/components/form-element/" }],
  } satisfies FindingGuide,

  headingHierarchy: {
    importance:
      "Screen readers build an outline from headings; skipped levels create confusing navigation and make it harder for users to understand page structure.",
    fixSteps: [
      "Ensure headings follow a sequential hierarchy (h1 \u2192 h2 \u2192 h3) without skipping levels.",
      "Use only one <h1> per page or template to establish a clear top-level topic.",
      "If visual sizing matters more than hierarchy, use CSS (font-size, font-weight) while keeping correct heading levels.",
    ],
    resources: [
      u22("info-and-relationships"),
      { label: "MDN: Heading elements", href: LINKS.mdnHeadings },
      { label: "WAI: Easy Checks", href: LINKS.waiEasyChecks },
    ],
  } satisfies FindingGuide,

  headingMultipleH1: {
    importance:
      "Multiple <h1> elements confuse the page outline for screen reader users and dilute the primary topic signal for assistive technology navigation.",
    fixSteps: [
      "Keep a single <h1> that names the page or template purpose.",
      "Demote extra h1 headings to h2 or lower as appropriate for their nesting context.",
    ],
    resources: [
      u22("info-and-relationships"),
      { label: "MDN: Heading elements", href: LINKS.mdnHeadings },
    ],
  } satisfies FindingGuide,

  landmarksMissing: {
    importance:
      "Landmarks let assistive technology users jump between page regions (navigation, main content, footer) instead of tabbing through every element sequentially.",
    fixSteps: [
      "Wrap primary content in <main>, navigation in <nav>, and branding/title area in <header>.",
      "For LWC, add landmarks inside the template or use SLDS page-header patterns that include semantic elements.",
      "Use aria-label on landmarks when multiple instances of the same type exist (e.g. two <nav> elements).",
    ],
    resources: [
      u22("info-and-relationships"),
      { label: "WAI: Landmark regions", href: LINKS.waiLandmarks },
      { label: "SLDS: Page layout", href: LINKS.sldsPageLayout },
    ],
  } satisfies FindingGuide,

  ariaRoleInvalid: {
    importance:
      "An invalid ARIA role is worse than no role \u2014 assistive technology may ignore the element entirely, leaving users unable to interact with or understand the control.",
    fixSteps: [
      "Check the role value against the WAI-ARIA specification role definitions.",
      "Fix typos (e.g. role=\"buttn\" \u2192 role=\"button\").",
      "Remove made-up roles that have no ARIA definition.",
    ],
    resources: [
      u22("name-role-value"),
      { label: "WAI-ARIA: Role definitions", href: LINKS.waiAriaRoles },
      { label: "MDN: ARIA roles", href: LINKS.mdnAriaRoles },
    ],
  } satisfies FindingGuide,

  ariaRolePresentationOnFocusable: {
    importance:
      "role=\"presentation\" or role=\"none\" removes an element from the accessibility tree; applying it to an interactive element hides it from assistive technology users.",
    fixSteps: [
      "Remove role=\"presentation\" or role=\"none\" from interactive elements (buttons, links, inputs).",
      "If the element should not be interactive, remove the click handler and tabindex instead.",
    ],
    resources: [
      u22("name-role-value"),
      { label: "WAI-ARIA: Role definitions", href: LINKS.waiAriaRoles },
    ],
  } satisfies FindingGuide,

  formErrorRequired: {
    importance:
      "Users need to know which fields are required and receive clear error messages when validation fails; without programmatic association, screen reader users miss these cues entirely.",
    fixSteps: [
      "For lightning-input with required, add message-when-value-missing (and other message-when-* as needed) so error text is announced.",
      "For native HTML inputs, use aria-describedby or aria-errormessage pointing to an error container.",
      "Ensure required fields are visually indicated (asterisk, label text) and programmatically marked (required attribute or aria-required).",
    ],
    resources: [
      u22("error-identification"),
      u22("labels-or-instructions"),
      { label: "LWC: lightning-input", href: LINKS.lwcInput },
    ],
  } satisfies FindingGuide,

  colorAlone: {
    importance:
      "Approximately 8% of men have some form of color vision deficiency; conveying status, errors, or categories by color alone excludes these users and fails WCAG 1.4.1.",
    fixSteps: [
      "Add a secondary indicator alongside color: an icon, text label, pattern, or underline.",
      "For error states, use lightning-input\u2019s built-in error patterns or add an icon + text like \"Error: \u2026\".",
      "Test with a color blindness simulator to verify that meaning is still clear without color.",
    ],
    resources: [
      u22("use-of-color"),
      u21("use-of-color"),
      { label: "SLDS: Accessibility", href: LINKS.sldsA11y },
    ],
  } satisfies FindingGuide,

  modalFocusManagement: {
    importance:
      "Keyboard users can become stranded behind a modal if focus is not trapped inside it; when the modal closes, focus must return to the trigger element or users lose their place.",
    fixSteps: [
      "Verify that keyboard focus is trapped inside the modal (Tab cycles within, not behind the overlay).",
      "Ensure pressing Escape closes the modal.",
      "After closing, return focus to the element that opened the modal.",
    ],
    resources: [
      { label: "WAI-ARIA: Dialog (Modal) pattern", href: LINKS.waiDialogPattern },
      { label: "SLDS: Modals", href: LINKS.sldsModal },
      { label: "LWC: Accessible components", href: LINKS.lwcA11y },
    ],
  } satisfies FindingGuide,

  generic: {
    importance:
      "Accessibility and consistent UX reduce rework in UAT, improve adoption, and align with organizational WCAG and Salesforce implementation standards.",
    fixSteps: ["Review the remediation and code snippet below.", "Validate the change in a sandbox with keyboard and screen reader smoke tests.", "Document the fix for release notes or audit trails."],
    resources: [
      { label: "WAI: WCAG Overview", href: "https://www.w3.org/WAI/standards-guidelines/wcag/" },
      { label: "LWC: Accessible components", href: LINKS.lwcA11y },
      { label: "SLDS: Accessibility", href: LINKS.sldsA11y },
    ],
  } satisfies FindingGuide,
} as const;
