export const DEFAULT_THEME = "theme-editions" as const;

export const THEME_IDS = [
  "theme-editions",
  "theme-paper",
  "theme-ink",
  "theme-champagne",
  "theme-slate",
  "theme-olive",
  "theme-dusk",
  "theme-rose",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/** Map legacy neon themes → elegant editions themes */
export const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  "theme-cosmic": "theme-editions",
  "theme-jetblack": "theme-ink",
  "theme-orchid": "theme-rose",
  "theme-wineash": "theme-champagne",
  "theme-turquoise": "theme-olive",
  "theme-candyblue": "theme-slate",
  "theme-lavender": "theme-dusk",
  "theme-violet": "theme-dusk",
};

export const THEMES: Array<{
  id: ThemeId;
  label: string;
  description: string;
  /** CSS background for swatch preview */
  swatch: string;
  mode: "dark" | "light";
}> = [
  {
    id: "theme-editions",
    label: "Editions",
    description: "Charcoal & sage",
    swatch: "linear-gradient(135deg, #141210 0%, #1F2E26 55%, #3D6B52 100%)",
    mode: "dark",
  },
  {
    id: "theme-paper",
    label: "Paper",
    description: "Warm gallery light",
    swatch: "linear-gradient(135deg, #F6F1E8 0%, #E8E0D2 50%, #2F6B4F 100%)",
    mode: "light",
  },
  {
    id: "theme-ink",
    label: "Ink",
    description: "Monochrome editorial",
    swatch: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 60%, #F5F5F5 100%)",
    mode: "dark",
  },
  {
    id: "theme-champagne",
    label: "Champagne",
    description: "Soft bronze glow",
    swatch: "linear-gradient(135deg, #1A1612 0%, #3D3228 50%, #C4A574 100%)",
    mode: "dark",
  },
  {
    id: "theme-slate",
    label: "Slate",
    description: "Cool steel blue",
    swatch: "linear-gradient(135deg, #0E1218 0%, #1C2533 55%, #6B8CAE 100%)",
    mode: "dark",
  },
  {
    id: "theme-olive",
    label: "Olive",
    description: "Moss & cream",
    swatch: "linear-gradient(135deg, #12140F 0%, #2A3220 50%, #8A9A5B 100%)",
    mode: "dark",
  },
  {
    id: "theme-dusk",
    label: "Dusk",
    description: "Indigo twilight",
    swatch: "linear-gradient(135deg, #0F1018 0%, #1E2030 55%, #6B6FA8 100%)",
    mode: "dark",
  },
  {
    id: "theme-rose",
    label: "Rose",
    description: "Dusty blush",
    swatch: "linear-gradient(135deg, #161214 0%, #2A2226 50%, #C4A0A8 100%)",
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

export function applyThemeClass(themeId: ThemeId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const id of THEME_IDS) root.classList.remove(id);
  for (const id of Object.keys(LEGACY_THEME_MAP)) root.classList.remove(id);
  root.classList.add(themeId);
  // Paper is light — drop .dark so light tokens win where needed
  if (themeId === "theme-paper") {
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
  }
}
