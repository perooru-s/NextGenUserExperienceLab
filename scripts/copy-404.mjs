import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
const indexHtml = join(dist, "index.html");
const notFoundHtml = join(dist, "404.html");

if (!existsSync(indexHtml)) {
  console.warn("copy-404: dist/index.html missing — skip");
  process.exit(0);
}

copyFileSync(indexHtml, notFoundHtml);
console.log("copy-404: wrote dist/404.html (SPA fallback for GitHub Pages)");
