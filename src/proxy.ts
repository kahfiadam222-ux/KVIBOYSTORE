import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { buildSecurityHeaders } from "@/lib/security/headers";

// middleware.ts is deprecated in Next.js 16 — proxy.ts replaces it.
// This runs before every matched request: refreshes the Supabase session
// AND injects a per-request nonce + strict CSP / security headers.
export async function proxy(request: NextRequest) {
  // Generate a fresh, unpredictable nonce per request so inline scripts/styles
  // (e.g. the theme bootstrap script in layout.tsx) can run under a strict CSP.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Forward the nonce to the app via a request header so Server Components can
  // read it with `headers()`. Keep all original headers intact (superset).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // updateSession manages the auth cookies and returns a response that carries
  // our forwarded request headers down to the app.
  const response = await updateSession(request, requestHeaders);

  // Apply the Content-Security-Policy (referencing the nonce) and the rest of
  // the hardening headers onto the final response sent to the browser.
  for (const [key, value] of Object.entries(buildSecurityHeaders(nonce))) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and image files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
