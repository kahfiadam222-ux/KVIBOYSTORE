import fs from "fs";
import pg from "pg";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const sql = fs.readFileSync("supabase/migrations/0013_storefront_cms.sql", "utf8");
const password =
  process.env.SUPABASE_DB_PASSWORD ||
  env.SUPABASE_DB_PASSWORD ||
  env.POSTGRES_PASSWORD ||
  env.DB_PASSWORD;
const dbUrl = process.env.DATABASE_URL || env.DATABASE_URL || env.SUPABASE_DB_URL;

const connectionString =
  dbUrl ||
  (password
    ? `postgresql://postgres.hfxbwyqxfamvuqipbnfo:${encodeURIComponent(password)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
    : null);

if (!connectionString) {
  console.error(
    "Need DATABASE_URL or SUPABASE_DB_PASSWORD (Supabase → Project Settings → Database → Database password)"
  );
  process.exit(2);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("Connected. Applying migration 0013...");
await client.query(sql);
const check = await client.query(
  "select count(*)::int as n from float_banners; select count(*)::int as h from storefront_hero;"
);
console.log("float_banners rows:", check[0]?.rows?.[0] ?? check.rows);
// When multiple statements, result may be array
if (Array.isArray(check)) {
  console.log(
    "counts:",
    check.map((r) => r.rows?.[0])
  );
}
await client.end();
console.log("Migration 0013 applied successfully.");
