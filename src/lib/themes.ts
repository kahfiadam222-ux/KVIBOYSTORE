export const DEFAULT_THEME = "theme-modernist" as const;

export const THEME_IDS = ["theme-modernist", "theme-modernist-dark"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

const LIGHT_THEMES = new Set<ThemeId>(["theme-modernist"]);

/** Semua tema lama dipetakan ke Modernist — palet lama sudah dihapus. */
export const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  "theme-daylight": "theme-modernist",
  "theme-paper": "theme-modernist",
  "theme-saffron": "theme-modernist",
  "theme-sakura": "theme-modernist-dark",
  "theme-editions": "theme-modernist-dark",
  "theme-ink": "theme-modernist-dark",
  "theme-champagne": "theme-modernist-dark",
  "theme-slate": "theme-modernist-dark",
  "theme-olive": "theme-modernist-dark",
  "theme-dusk": "theme-modernist-dark",
  "theme-rose": "theme-modernist-dark",
  "theme-cosmic": "theme-modernist-dark",
  "theme-jetblack": "theme-modernist-dark",
  "theme-orchid": "theme-modernist-dark",
  "theme-wineash": "theme-modernist-dark",
  "theme-turquoise": "theme-modernist-dark",
  "theme-candyblue": "theme-modernist-dark",
  "theme-lavender": "theme-modernist-dark",
  "theme-violet": "theme-modernist-dark",
  "theme-midnight": "theme-modernist-dark",
  "theme-mono": "theme-modernist-dark",
  "theme-ocean": "theme-modernist-dark",
  "theme-forest": "theme-modernist-dark",
  "theme-aether": "theme-modernist-dark",
  "theme-ember": "theme-modernist-dark",
};

export const THEMES: Array<{
  id: ThemeId;
  label: string;
  description: string;
  swatch: string;
  mode: "dark" | "light";
}> = [
  {
    id: "theme-modernist",
    label: "Modernist",
    description: "Kertas terang, aksen merah-oranye",
    swatch: "linear-gradient(135deg, #f3f2f2 0%, #eae9e9 55%, #ec3013 100%)",
    mode: "light",
  },
  {
    id: "theme-modernist-dark",
    label: "Modernist Gelap",
    description: "Arang pekat, aksen merah-oranye",
    swatch: "linear-gradient(135deg, #17181a 0%, #212226 55%, #ff563c 100%)",
    mode: "dark",
  },
];

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return !!value && (THEME_IDS as readonly string[]).includes(value);
}

export function resolveThemeId(raw: string | null | undefined): ThemeId {
  if (!raw) return DEFAULT_THEME;
  if (isThemeId(raw)) return raw;
  if (raw in LEGACY_THEME_MAP) return LEGACY_THEME_MAP[raw];
  return DEFAULT_THEME;
}

export function isLightTheme(themeId: ThemeId) {
  return LIGHT_THEMES.has(themeId);
}

export function applyThemeClass(themeId: ThemeId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const id of THEME_IDS) root.classList.remove(id);
  for (const id of Object.keys(LEGACY_THEME_MAP)) root.classList.remove(id);
  root.classList.add(themeId);
  if (isLightTheme(themeId)) {
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
  }
}
