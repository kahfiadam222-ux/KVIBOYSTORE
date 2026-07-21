import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Kunci root Turbopack ke folder proyek. Tanpa ini, adanya lockfile ganda
  // (mis. C:\Users\<user>\package-lock.json) membuat Turbopack salah memilih
  // workspace root → file-watcher meleset dan perubahan globals.css tidak ter-HMR.
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    serverActions: {
      // Foto produk/banner dikirim ke Server Action sebagai data URL base64.
      // Default 1MB terlalu kecil → upload foto gagal & gambar tak muncul.
      // 4MB memberi ruang, tetap di bawah batas request Vercel (~4.5MB).
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
