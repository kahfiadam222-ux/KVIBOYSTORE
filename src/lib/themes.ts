export const DEFAULT_THEME = "theme-midnight" as const;

export const THEME_IDS = [
  "theme-midnight",
  "theme-daylight",
  "theme-mono",
  "theme-ocean",
  "theme-forest",
  "theme-sakura",
  "theme-aether",
  "theme-ember",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

const LIGHT_THEMES = new Set<ThemeId>(["theme-daylight"]);

/** Map legacy theme ids → current set */
export const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  "theme-editions": "theme-midnight",
  "theme-paper": "theme-daylight",
  "theme-ink": "theme-mono",
  "theme-champagne": "theme-ember",
  "theme-slate": "theme-ocean",
  "theme-olive": "theme-forest",
  "theme-dusk": "theme-aether",
  "theme-rose": "theme-sakura",
  "theme-cosmic": "theme-aether",
  "theme-jetblack": "theme-mono",
  "theme-orchid": "theme-sakura",
  "theme-wineash": "theme-ember",
  "theme-turquoise": "theme-forest",
  "theme-candyblue": "theme-ocean",
  "theme-lavender": "theme-aether",
  "theme-violet": "theme-aether",
};

export const THEMES: Array<{
  id: ThemeId;
  label: string;
  description: string;
  swatch: string;
  mode: "dark" | "light";
}> = [
  {
    id: "theme-midnight",
    label: "Midnight",
    description: "Netral gelap modern",
    swatch: "linear-gradient(135deg, #0C0D10 0%, #1A1C22 50%, #4F6D8A 100%)",
    mode: "dark",
  },
  {
    id: "theme-daylight",
    label: "Daylight",
    description: "Terang bersih",
    swatch: "linear-gradient(135deg, #F7F8FA 0%, #E8ECF2 55%, #3B6E9E 100%)",
    mode: "light",
  },
  {
    id: "theme-mono",
    label: "Mono",
    description: "Hitam putih tegas",
    swatch: "linear-gradient(135deg, #09090B 0%, #18181B 55%, #FAFAFA 100%)",
    mode: "dark",
  },
  {
    id: "theme-ocean",
    label: "Ocean",
    description: "Biru laut tenang",
    swatch: "linear-gradient(135deg, #0A121A 0%, #152433 50%, #3D8ABF 100%)",
    mode: "dark",
  },
  {
    id: "theme-forest",
    label: "Forest",
    description: "Hijau sage soft",
    swatch: "linear-gradient(135deg, #0C120E 0%, #1A241C 50%, #4A8A62 100%)",
    mode: "dark",
  },
  {
    id: "theme-sakura",
    label: "Sakura",
    description: "Anime malam sakura",
    swatch: "linear-gradient(135deg, #1A1218 0%, #3A2230 45%, #E8A0B8 100%)",
    mode: "dark",
  },
  {
    id: "theme-aether",
    label: "Aether",
    description: "Anime soft cyber",
    swatch: "linear-gradient(135deg, #10101A 0%, #2A2440 45%, #8B7CF0 70%, #5EC8E8 100%)",
    mode: "dark",
  },
  {
    id: "theme-ember",
    label: "Ember",
    description: "Hangat copper",
    swatch: "linear-gradient(135deg, #14100E 0%, #2A2018 50%, #C4895A 100%)",
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
