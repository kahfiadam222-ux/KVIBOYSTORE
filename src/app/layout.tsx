import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { WelcomeScreen } from "@/components/effects/WelcomeScreen";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
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
      className={`theme-modernist ${archivo.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var valid = ["theme-modernist","theme-modernist-dark"];
                var t = localStorage.getItem("kvibo-theme");
                if (!t || valid.indexOf(t) === -1) t = "theme-modernist";
                localStorage.setItem("kvibo-theme", t);
                var root = document.documentElement;
                root.classList.remove("theme-modernist", "theme-modernist-dark");
                root.classList.add(t);
                if (t === "theme-modernist-dark") {
                  root.classList.add("dark");
                } else {
                  root.classList.remove("dark");
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="h-full">
        <WelcomeScreen />
        {children}
      </body>
    </html>
  );
}
