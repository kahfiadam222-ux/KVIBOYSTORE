import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { SpaceBackground } from "@/components/effects/SpaceBackground";
import { AmbientOrbs } from "@/components/effects/AmbientOrbs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "kviboystore — Marketplace Digital",
  description:
    "Marketplace langganan digital. Instant delivery, escrow aman, produk terverifikasi.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="id"
      className={`dark ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var valid = ["theme-midnight","theme-daylight","theme-mono","theme-ocean","theme-forest","theme-sakura","theme-aether","theme-ember"];
                var legacy = {
                  "theme-editions":"theme-midnight","theme-paper":"theme-daylight","theme-ink":"theme-mono",
                  "theme-champagne":"theme-ember","theme-slate":"theme-ocean","theme-olive":"theme-forest",
                  "theme-dusk":"theme-aether","theme-rose":"theme-sakura","theme-cosmic":"theme-aether",
                  "theme-jetblack":"theme-mono","theme-orchid":"theme-sakura","theme-wineash":"theme-ember",
                  "theme-turquoise":"theme-forest","theme-candyblue":"theme-ocean","theme-lavender":"theme-aether",
                  "theme-violet":"theme-aether"
                };
                var t = localStorage.getItem("kvibo-theme");
                if (legacy[t]) t = legacy[t];
                if (!t || valid.indexOf(t) === -1) t = "theme-midnight";
                localStorage.setItem("kvibo-theme", t);
                document.documentElement.classList.add(t);
                if (t === "theme-daylight") {
                  document.documentElement.classList.remove("dark");
                } else {
                  document.documentElement.classList.add("dark");
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SpaceBackground />
        <AmbientOrbs />
        {children}
      </body>
    </html>
  );
}
