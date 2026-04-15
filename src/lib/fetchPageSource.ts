const MAX_BYTES = 2_000_000;

export type FetchPageErrorCode =
  | "INVALID_URL"
  | "NETWORK"
  | "HTTP"
  | "CORS"
  | "TOO_LARGE"
  | "PROXY"
  | "BAD_RESPONSE";

export type FetchPageResult =
  | { ok: true; html: string; via: "direct" | "proxy"; finalUrl: string }
  | { ok: false; error: string; code: FetchPageErrorCode };

/** Normalize user input into an http(s) URL, or null if invalid. */
export function normalizeReviewUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  let u: URL;
  try {
    u = new URL(candidate);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  if (!u.hostname) return null;
  return u;
}

function proxyEndpoint(targetUrl: string): string | null {
  const encoded = encodeURIComponent(targetUrl);
  if (import.meta.env.DEV) {
    return `/api/fetch-page?url=${encoded}`;
  }
  const base = import.meta.env.VITE_PAGE_FETCH_PROXY?.trim();
  if (!base) return null;
  const sep = base.includes("?") ? "&" : "?";
  return `${base.replace(/\/$/, "")}${sep}url=${encoded}`;
}

type ProxyJson = { html?: string; finalUrl?: string; error?: string };

/**
 * Fetches HTML for static review. Uses the dev-server proxy in development, or
 * `VITE_PAGE_FETCH_PROXY` in production when set. Otherwise attempts a direct
 * browser fetch (only works when the target sends permissive CORS headers).
 */
export async function fetchPageSource(inputUrl: string): Promise<FetchPageResult> {
  const url = normalizeReviewUrl(inputUrl);
  if (!url) {
    return { ok: false, error: "Enter a valid http(s) URL (for example https://example.com).", code: "INVALID_URL" };
  }

  const proxy = proxyEndpoint(url.toString());
  if (proxy) {
    try {
      const r = await fetch(proxy, { credentials: "omit" });
      let data: ProxyJson = {};
      try {
        data = (await r.json()) as ProxyJson;
      } catch {
        return { ok: false, error: "Proxy returned invalid JSON.", code: "PROXY" };
      }
      if (!r.ok) {
        return {
          ok: false,
          error: typeof data.error === "string" ? data.error : `Proxy request failed (${r.status}).`,
          code: "PROXY",
        };
      }
      if (typeof data.html !== "string") {
        return { ok: false, error: "Proxy response did not include HTML.", code: "BAD_RESPONSE" };
      }
      if (data.html.length > MAX_BYTES) {
        return { ok: false, error: "Page HTML exceeds the size limit for review.", code: "TOO_LARGE" };
      }
      const finalUrl = typeof data.finalUrl === "string" && data.finalUrl ? data.finalUrl : url.toString();
      return { ok: true, html: data.html, via: "proxy", finalUrl };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: msg || "Could not reach the fetch proxy.", code: "NETWORK" };
    }
  }

  try {
    const r = await fetch(url.toString(), {
      mode: "cors",
      credentials: "omit",
      redirect: "follow",
      headers: { Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1" },
    });
    if (!r.ok) {
      return { ok: false, error: `The server responded with HTTP ${r.status}.`, code: "HTTP" };
    }
    const html = await r.text();
    if (html.length > MAX_BYTES) {
      return { ok: false, error: "Page HTML exceeds the size limit for review.", code: "TOO_LARGE" };
    }
    return { ok: true, html, via: "direct", finalUrl: r.url || url.toString() };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const looksCors =
      e instanceof TypeError || /failed to fetch|networkerror|load failed|network request failed/i.test(msg);
    return {
      ok: false,
      error: looksCors
        ? "This page cannot be fetched from the browser (usually CORS). Run the app with `npm run dev` to use the built-in proxy, or set VITE_PAGE_FETCH_PROXY to your own fetch endpoint."
        : msg || "Request failed.",
      code: looksCors ? "CORS" : "NETWORK",
    };
  }
}
