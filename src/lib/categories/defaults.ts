export type SidebarCategory = {
  id: string;
  label: string;
  href: string;
  /** Lucide icon name, used as fallback when `iconUrl` is empty. */
  iconName: string;
  /** Uploaded logo (compressed data URL) — overrides the lucide icon when set. */
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

/** Fallback categories — mirror the seed in 0017_sidebar_categories.sql.
 *  Used when the DB table doesn't exist yet or returns no rows. */
export const DEFAULT_CATEGORIES: SidebarCategory[] = [
  { id: "netflix", label: "Netflix", href: "/?q=netflix", iconName: "Tv", iconUrl: null, sortOrder: 0, isActive: true },
  { id: "spotify", label: "Spotify", href: "/?q=spotify", iconName: "Music2", iconUrl: null, sortOrder: 1, isActive: true },
  { id: "canva", label: "Canva Pro", href: "/?q=canva", iconName: "Palette", iconUrl: null, sortOrder: 2, isActive: true },
  { id: "chatgpt", label: "ChatGPT Plus", href: "/?q=chatgpt", iconName: "Bot", iconUrl: null, sortOrder: 3, isActive: true },
  { id: "vpn", label: "VPN Premium", href: "/?q=vpn", iconName: "Shield", iconUrl: null, sortOrder: 4, isActive: true },
  { id: "microsoft", label: "Microsoft 365", href: "/?q=microsoft", iconName: "FileText", iconUrl: null, sortOrder: 5, isActive: true },
];
