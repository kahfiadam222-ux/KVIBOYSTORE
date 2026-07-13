import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "KVIBOYSTORE",
  description: "Marketplace langganan digital premium — terpercaya, terverifikasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem("kvibo-theme");
                if (t) {
                  document.documentElement.classList.add(t);
                } else {
                  document.documentElement.classList.add("theme-cyber");
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
