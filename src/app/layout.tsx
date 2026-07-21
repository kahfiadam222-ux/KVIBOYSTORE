import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { AmbientOrbs } from "@/components/effects/AmbientOrbs";
import { WelcomeScreen } from "@/components/effects/WelcomeScreen";
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
                var valid = ["theme-daylight","theme-sakura","theme-saffron"];
                var legacy = {
                  "theme-editions":"theme-saffron","theme-paper":"theme-daylight","theme-ink":"theme-saffron",
                  "theme-champagne":"theme-saffron","theme-slate":"theme-saffron","theme-olive":"theme-saffron",
                  "theme-dusk":"theme-saffron","theme-rose":"theme-saffron","theme-cosmic":"theme-saffron",
                  "theme-jetblack":"theme-saffron","theme-orchid":"theme-saffron","theme-wineash":"theme-saffron",
                  "theme-turquoise":"theme-saffron","theme-candyblue":"theme-saffron","theme-lavender":"theme-saffron",
                  "theme-violet":"theme-saffron","theme-midnight":"theme-saffron","theme-mono":"theme-saffron",
                  "theme-ocean":"theme-saffron","theme-forest":"theme-saffron","theme-aether":"theme-saffron",
                  "theme-ember":"theme-saffron"
                };
                var t = localStorage.getItem("kvibo-theme");
                if (legacy[t]) t = legacy[t];
                if (!t || valid.indexOf(t) === -1) t = "theme-saffron";
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
        <SaffronWashBackground />
        <WelcomeScreen />
        {children}
      </body>
    </html>
  );
}
