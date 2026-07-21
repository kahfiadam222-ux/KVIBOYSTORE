import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Kunci root Turbopack ke folder proyek. Tanpa ini, adanya lockfile ganda
  // (mis. C:\Users\<user>\package-lock.json) membuat Turbopack salah memilih
  // workspace root → file-watcher meleset dan perubahan globals.css tidak ter-HMR.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
