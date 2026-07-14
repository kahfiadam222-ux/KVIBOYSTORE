import type { Metadata } from "next";
import {
  Instrument_Serif,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { headers } from "next/headers";
import { SpaceBackground } from "@/components/effects/SpaceBackground";
import { AmbientOrbs } from "@/components/effects/AmbientOrbs";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "KVIBOYSTORE — Marketplace Digital Premium",
  description:
    "Marketplace langganan digital premium. Instant delivery, escrow aman, produk terverifikasi.",
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
      className={`dark ${jakarta.variable} ${instrument.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var valid = ["theme-editions","theme-paper","theme-ink","theme-champagne","theme-slate","theme-olive","theme-dusk","theme-rose"];
                var legacy = {"theme-cosmic":"theme-editions","theme-jetblack":"theme-ink","theme-orchid":"theme-rose","theme-wineash":"theme-champagne","theme-turquoise":"theme-olive","theme-candyblue":"theme-slate","theme-lavender":"theme-dusk","theme-violet":"theme-dusk"};
                var t = localStorage.getItem("kvibo-theme");
                if (legacy[t]) t = legacy[t];
                if (!t || valid.indexOf(t) === -1) t = "theme-editions";
                localStorage.setItem("kvibo-theme", t);
                document.documentElement.classList.add(t);
                if (t === "theme-paper") {
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
