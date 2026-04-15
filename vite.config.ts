import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fetchPageProxyPlugin } from "./fetchPageProxyPlugin";

/** Trailing slash required. Use `/repo-name/` for GitHub project pages, `/` for user site or local dev. */
const base = (process.env.VITE_BASE_PATH?.trim() || "/").replace(/\/?$/, "/");

export default defineConfig({
  plugins: [react(), fetchPageProxyPlugin()],
  base,
});
