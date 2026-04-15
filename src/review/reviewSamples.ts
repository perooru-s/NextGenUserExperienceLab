/** Which bundled demo template to load into the markup editor. */
export type ReviewDemoSampleId = "issues" | "clean";

/**
 * Demo with findings across UX consistency, accessibility, mobile, and SLDS —
 * fixed widths, low contrast, missing labels, div click handlers, small controls, etc.
 */
export const SAMPLE_LWC_WITH_ISSUES = `<template>
  <lightning-card
    title="Demo: UX consistency, accessibility, mobile & SLDS"
    icon-name="standard:case"
  >
    <!-- Fixed-width shell: mobile / reflow (1.4.10-style messaging in findings) -->
    <div class="slds-p-around_medium" style="width: 920px; min-width: 920px;">
      <p class="slds-text-body_small slds-m-bottom_small">
        Intentionally problematic markup for training — low contrast, missing labels, pointer handlers on non-buttons,
        fixed pixel widths, and small SLDS control variants.
      </p>

      <!-- Heading hierarchy: skipped level (h2 → h4) -->
      <h2>Section overview</h2>
      <h4>Detail subsection — skips h3</h4>

      <p style="color: #888888; background-color: #999999;">Low-contrast inline text (demo)</p>

      <!-- Color alone: red text with no icon or text indicator -->
      <span style="color: red">Validation failed</span>

      <div class="slds-m-vertical_small" onclick={handleClick}>
        <img src={logoUrl} />
        <lightning-input name="email" type="email" value={email} onchange={handleEmail}></lightning-input>
        <lightning-button variant="brand" onclick={save}></lightning-button>
      </div>

      <!-- Required field without error messages -->
      <lightning-input label="Phone" name="phone" type="tel" required></lightning-input>

      <!-- Invalid ARIA role (typo) -->
      <div role="buttn" tabindex="0" onclick={handleAction}>Custom action</div>

      <div class="slds-border_top slds-p-top_medium slds-m-top_medium">
        <div class="slds-grid slds-wrap slds-gutters_small slds-grid_vertical-align-center">
          <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
            <lightning-input
              label="Job notes"
              name="notes"
              type="text"
              placeholder="Small tap targets on the right →"
            ></lightning-input>
          </div>
          <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-text-align_right">
            <lightning-button
              label="More"
              variant="neutral"
              class="slds-button--small"
              title="SLDS small — verify WCAG 2.5.8 / 2.5.5 target size"
            ></lightning-button>
            <lightning-button-icon
              icon-name="utility:settings"
              alternative-text="Settings"
              variant="border-filled"
              class="slds-button_icon-small"
            ></lightning-button-icon>
            <lightning-button-icon
              icon-name="utility:delete"
              alternative-text="Delete row"
              variant="border-inverse"
              class="slds-button_icon-small"
            ></lightning-button-icon>
          </div>
        </div>
        <div class="slds-m-top_small" style="width: 800px;">
          <p style="font-size: 10px; line-height: 1.2;">
            10px copy is hard to read on phones — validate in device mode (not a separate static rule here).
          </p>
        </div>
      </div>

      <!-- Modal: triggers focus management reminder -->
      <section role="dialog" aria-modal="true" aria-label="Confirm delete">
        <p>Are you sure you want to delete this record?</p>
        <lightning-button label="Cancel" variant="neutral" onclick={closeModal}></lightning-button>
        <lightning-button label="Delete" variant="destructive" onclick={confirmDelete}></lightning-button>
      </section>
    </div>
  </lightning-card>
</template>`;

/**
 * Passing markup: SLDS utilities, labels on inputs/buttons, no fixed pixel widths in styles,
 * no small control variants — static analysis reports no critical / major / minor findings (info-only reminders may still appear for AA).
 */
export const SAMPLE_LWC_CLEAN = `<template>
  <div class="slds-scope slds-p-around_medium">
    <lightning-card title="Clean sample: accessible Lightning markup" icon-name="standard:account">
      <div class="slds-grid slds-wrap slds-gutters_small">
        <div class="slds-col slds-size_1-of-1">
          <p class="slds-text-body_regular slds-m-bottom_small">
            Uses SLDS layout utilities, labeled controls, and responsive column sizing — no intentional violations for the static checker.
          </p>
        </div>
        <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
          <lightning-input
            label="Account name"
            name="accountName"
            type="text"
            value={accountName}
            onchange={handleAccountName}
          ></lightning-input>
        </div>
        <div class="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-text-align_right">
          <lightning-button label="Save" variant="brand" onclick={handleSave}></lightning-button>
        </div>
      </div>
    </lightning-card>
  </div>
</template>`;
