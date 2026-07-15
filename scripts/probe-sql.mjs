import fs from "fs";

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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const ref = new URL(url).hostname.split(".")[0];
const sql = fs.readFileSync("supabase/migrations/0013_storefront_cms.sql", "utf8");

const tries = [
  {
    name: "pg-meta",
    url: `${url}/pg/query`,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: { query: sql },
  },
  {
    name: "api.supabase query",
    url: `https://api.supabase.com/v1/projects/${ref}/database/query`,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: { query: sql },
  },
  {
    name: "api.supabase query apikey",
    url: `https://api.supabase.com/v1/projects/${ref}/database/query`,
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: { query: sql },
  },
];

for (const t of tries) {
  try {
    const r = await fetch(t.url, {
      method: "POST",
      headers: t.headers,
      body: JSON.stringify(t.body),
    });
    console.log(t.name, r.status, (await r.text()).slice(0, 250));
  } catch (e) {
    console.log(t.name, "ERR", e.message);
  }
}
