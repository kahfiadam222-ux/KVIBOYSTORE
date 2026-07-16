import { rm } from "fs/promises";
import { join } from "path";

const pathsToClean = [
  ".next",
  ".vercel",
  "tsconfig.tsbuildinfo",
  "node_modules/.cache",
];

const projectRoot = process.cwd();

async function clean() {
  console.log("🧹 Cleaning build and compilation caches...");
  for (const p of pathsToClean) {
    const fullPath = join(projectRoot, p);
    try {
      await rm(fullPath, { recursive: true, force: true });
      console.log(`✅ Cleaned: ${p}`);
    } catch (err) {
      console.error(`❌ Failed to clean ${p}:`, err.message);
    }
  }
  console.log("✨ Cache clean completed!");
}

clean();
