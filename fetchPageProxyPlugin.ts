import type { Plugin } from "vite";
import type { ServerResponse } from "node:http";

const MAX_BYTES = 2_000_000;

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

/**
 * Dev-only: same-origin `/api/fetch-page?url=` fetches remote HTML server-side so the
 * review tool can load arbitrary public URLs without browser CORS limits.
 */
export function fetchPageProxyPlugin(): Plugin {
  return {
    name: "lightning-a11y-fetch-page-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/fetch-page")) {
          next();
          return;
        }
        if (req.method !== "GET" && req.method !== "HEAD") {
          res.statusCode = 405;
          res.setHeader("Allow", "GET, HEAD");
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let target: URL;
        try {
          const local = new URL(req.url, "http://localhost");
          const raw = local.searchParams.get("url");
          if (!raw) {
            json(res, 400, { error: "Missing url query parameter." });
            return;
          }
          target = new URL(raw);
        } catch {
          json(res, 400, { error: "Invalid url query parameter." });
          return;
        }

        if (target.protocol !== "http:" && target.protocol !== "https:") {
          json(res, 400, { error: "Only http and https URLs are allowed." });
          return;
        }

        if (req.method === "HEAD") {
          res.statusCode = 204;
          res.end();
          return;
        }

        try {
          const r = await fetch(target.toString(), {
            redirect: "follow",
            headers: {
              Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
              "User-Agent": "LightningA11yLabReviewTool/1.0 (local dev proxy)",
            },
          });
          if (!r.ok) {
            json(res, 502, { error: `Upstream returned HTTP ${r.status}.` });
            return;
          }
          const buf = await r.arrayBuffer();
          if (buf.byteLength > MAX_BYTES) {
            json(res, 413, { error: "Upstream response too large for review." });
            return;
          }
          const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
          json(res, 200, { html, finalUrl: r.url });
        } catch (e) {
          json(res, 502, { error: e instanceof Error ? e.message : "Upstream fetch failed." });
        }
      });
    },
  };
}
