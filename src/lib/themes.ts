export const DEFAULT_THEME = "theme-sakura" as const;

export const THEME_IDS = [
  "theme-daylight",
  "theme-sakura",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

const LIGHT_THEMES = new Set<ThemeId>(["theme-daylight"]);

/** Map legacy theme ids → current set (only Daylight and Sumi-e remain) */
export const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  "theme-editions": "theme-sakura",
  "theme-paper": "theme-daylight",
  "theme-ink": "theme-sakura",
  "theme-champagne": "theme-sakura",
  "theme-slate": "theme-sakura",
  "theme-olive": "theme-sakura",
  "theme-dusk": "theme-sakura",
  "theme-rose": "theme-sakura",
  "theme-cosmic": "theme-sakura",
  "theme-jetblack": "theme-sakura",
  "theme-orchid": "theme-sakura",
  "theme-wineash": "theme-sakura",
  "theme-turquoise": "theme-sakura",
  "theme-candyblue": "theme-sakura",
  "theme-lavender": "theme-sakura",
  "theme-violet": "theme-sakura",
  "theme-midnight": "theme-sakura",
  "theme-mono": "theme-sakura",
  "theme-ocean": "theme-sakura",
  "theme-forest": "theme-sakura",
  "theme-aether": "theme-sakura",
  "theme-ember": "theme-sakura",
};

export const THEMES: Array<{
  id: ThemeId;
  label: string;
  description: string;
  swatch: string;
  mode: "dark" | "light";
}> = [
  {
    id: "theme-daylight",
    label: "Daylight",
    description: "Terang bersih",
    swatch: "linear-gradient(135deg, #F7F8FA 0%, #E8ECF2 55%, #3B6E9E 100%)",
    mode: "light",
  },
  {
    id: "theme-sakura",
    label: "Sumi-e",
    description: "Tinta kuas & merah Jepang",
    swatch: "linear-gradient(135deg, #101012 0%, #222226 50%, #BC2026 100%)",
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
