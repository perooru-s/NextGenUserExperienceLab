/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Team password baked into the production bundle when set at build time. */
  readonly VITE_SITE_PASSWORD?: string;
  /** Contact form mailto recipient (optional; defaults to placeholder in UI). */
  readonly VITE_CONTACT_EMAIL?: string;
  /**
   * Optional same-origin or absolute URL for production “live URL” fetch (returns JSON `{ html, finalUrl }`).
   * Dev server uses `/api/fetch-page` automatically.
   */
  readonly VITE_PAGE_FETCH_PROXY?: string;
}
