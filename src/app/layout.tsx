import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { SpaceBackground } from "@/components/effects/SpaceBackground";
import { AmbientOrbs } from "@/components/effects/AmbientOrbs";
import { WelcomeScreen } from "@/components/effects/WelcomeScreen";
import { InteractiveBackground } from "@/components/effects/InteractiveBackground";
import { SaffronWashBackground } from "@/components/effects/SaffronWashBackground";
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
                var valid = ["theme-daylight","theme-sakura"];
                var legacy = {
                  "theme-editions":"theme-sakura","theme-paper":"theme-daylight","theme-ink":"theme-sakura",
                  "theme-champagne":"theme-sakura","theme-slate":"theme-sakura","theme-olive":"theme-sakura",
                  "theme-dusk":"theme-sakura","theme-rose":"theme-sakura","theme-cosmic":"theme-sakura",
                  "theme-jetblack":"theme-sakura","theme-orchid":"theme-sakura","theme-wineash":"theme-sakura",
                  "theme-turquoise":"theme-sakura","theme-candyblue":"theme-sakura","theme-lavender":"theme-sakura",
                  "theme-violet":"theme-sakura","theme-midnight":"theme-sakura","theme-mono":"theme-sakura",
                  "theme-ocean":"theme-sakura","theme-forest":"theme-sakura","theme-aether":"theme-sakura",
                  "theme-ember":"theme-sakura"
                };
                var t = localStorage.getItem("kvibo-theme");
                if (legacy[t]) t = legacy[t];
                if (!t || valid.indexOf(t) === -1) t = "theme-sakura";
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
      <body className="h-full">
        <AmbientOrbs />
        <InteractiveBackground />
        <SaffronWashBackground />
        <WelcomeScreen />
        {children}
      </body>
    </html>
  );
}
