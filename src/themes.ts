export const THEME_STORAGE_KEY = "lightning-a11y-lab-theme";

export type ThemeId = "red-sunburst" | "spectrum" | "harbor" | "inferno" | "forge" | "clicko" | "pwc";

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: "pwc", label: "PwC Theme" },
  { id: "red-sunburst", label: "Red Sunburst" },
  { id: "spectrum", label: "Spectrum" },
  { id: "harbor", label: "Harbor" },
  { id: "inferno", label: "Inferno" },
  { id: "forge", label: "Forge" },
  { id: "clicko", label: "Clicko" },
];

const DEFAULT_THEME: ThemeId = "pwc";

export function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v && THEMES.some((t) => t.id === v)) return v as ThemeId;
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}

export function applyTheme(theme: ThemeId): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}
