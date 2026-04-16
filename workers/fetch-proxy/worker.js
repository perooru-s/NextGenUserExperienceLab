/**
 * Cloudflare Worker — lightweight CORS proxy for Lightning A11y Lab.
 *
 * Accepts:  GET /?url=<encoded-url>
 * Returns:  { "html": "…", "finalUrl": "https://…" }
 *
 * Deploy:   npx wrangler deploy   (from this directory)
 */

const MAX_BYTES = 2_000_000;
const ALLOWED_ORIGINS = [
  "https://perooru-s.github.io",
  "http://localhost:5173",
  "http://localhost:4173",
];

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(request, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(request),
    },
  });
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return json(request, 405, { error: "Method not allowed" });
    }

    const url = new URL(request.url);
    const target = url.searchParams.get("url");

    if (!target) {
      return json(request, 400, { error: "Missing ?url= query parameter." });
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch {
      return json(request, 400, { error: "Invalid URL." });
    }

    if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
      return json(request, 400, { error: "Only http and https URLs are supported." });
    }

    if (request.method === "HEAD") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    try {
      const upstream = await fetch(targetUrl.toString(), {
        redirect: "follow",
        headers: {
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
          "User-Agent": "LightningA11yLabProxy/1.0",
        },
      });

      if (!upstream.ok) {
        return json(request, 502, { error: `Upstream returned HTTP ${upstream.status}.` });
      }

      const buf = await upstream.arrayBuffer();
      if (buf.byteLength > MAX_BYTES) {
        return json(request, 413, { error: "Page too large for review (limit 2 MB)." });
      }

      const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
      return json(request, 200, { html, finalUrl: upstream.url });
    } catch (e) {
      return json(request, 502, {
        error: e instanceof Error ? e.message : "Upstream fetch failed.",
      });
    }
  },
};
