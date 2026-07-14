import type { Metadata } from "next";
import { Geist, Geist_Mono, Rajdhani } from "next/font/google";
import { headers } from "next/headers";
import { SpaceBackground } from "@/components/effects/SpaceBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-qurova",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KVIBOYSTORE",
  description: "Marketplace langganan digital premium — terpercaya, terverifikasi.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The nonce is generated per-request in src/proxy.ts and forwarded here so the
  // inline theme bootstrap script can run under the strict Content-Security-Policy.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="id"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} h-full antialiased`}
    >
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const valid = ["theme-jetblack", "theme-cosmic", "theme-orchid", "theme-wineash", "theme-turquoise", "theme-candyblue", "theme-lavender", "theme-violet"];
                const t = localStorage.getItem("kvibo-theme");
                if (t && valid.indexOf(t) !== -1) {
                  document.documentElement.classList.add(t);
                } else {
                  localStorage.setItem("kvibo-theme", "theme-cosmic");
                  document.documentElement.classList.add("theme-cosmic");
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SpaceBackground />
        {children}
      </body>
    </html>
  );
}
