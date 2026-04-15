/** React Router basename for Vite `base` (GitHub Pages subpath or `/`). */
export function routerBasename(): string {
  const b = import.meta.env.BASE_URL;
  if (b === "/" || b === "") return "/";
  return b.endsWith("/") ? b.slice(0, -1) : b;
}
