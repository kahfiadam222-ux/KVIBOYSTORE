import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const env = {
  ...loadEnv(path.join(root, ".env.local")),
  ...loadEnv(path.join(root, ".env")),
};

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = env.DATABASE_URL || env.SUPABASE_DB_URL || env.POSTGRES_URL;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sql = fs.readFileSync(
  path.join(root, "supabase/migrations/0013_storefront_cms.sql"),
  "utf8"
);

const projectRef = new URL(url).hostname.split(".")[0];
console.log("Project:", projectRef);

// Prefer direct Postgres if connection string exists
async function runWithPg() {
  if (!dbUrl) return false;
  const { default: pg } = await import("pg").catch(() => ({ default: null }));
  if (!pg) {
    console.log("pg package not installed");
    return false;
  }
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log("OK: migration applied via DATABASE_URL");
    return true;
  } finally {
    await client.end();
  }
}

async function tryMetaEndpoints() {
  const endpoints = [
    `${url}/pg/query`,
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  ];
  for (const ep of endpoints) {
    try {
      const r = await fetch(ep, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: sql }),
      });
      const t = await r.text();
      console.log(ep, "->", r.status, t.slice(0, 300));
      if (r.ok) return true;
    } catch (e) {
      console.log(ep, "ERR", e.message);
    }
  }
  return false;
}

// Split statements and apply via Supabase REST by using a temporary approach:
// execute each CREATE using postgres wire protocol over supabase pooler with service role
// is not possible. Instead use the Management API if SUPABASE_ACCESS_TOKEN is set.
async function tryAccessToken() {
  const token = env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) return false;
  const ep = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const r = await fetch(ep, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  const t = await r.text();
  console.log("access_token query ->", r.status, t.slice(0, 400));
  return r.ok;
}

const okPg = await runWithPg().catch((e) => {
  console.log("pg failed:", e.message);
  return false;
});
if (okPg) process.exit(0);

const okToken = await tryAccessToken();
if (okToken) process.exit(0);

const okMeta = await tryMetaEndpoints();
if (okMeta) process.exit(0);

console.error(`
Could not run DDL with available credentials.
Service role cannot create tables via REST.

Options:
1) Set DATABASE_URL (Postgres connection string from Supabase → Settings → Database)
2) Set SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens)
3) Paste supabase/migrations/0013_storefront_cms.sql into Supabase SQL Editor and Run
`);
process.exit(2);
