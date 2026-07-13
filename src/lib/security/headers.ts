// Centralized security response headers for kviboystore.
// Applied to every response by src/proxy.ts (the Next.js 16 proxy).
//
// The Content-Security-Policy uses a per-request nonce so the only inline
// script in the app (the theme bootstrap in layout.tsx) can run safely.

export function buildSecurityHeaders(nonce: string): Record<string, string> {
  const isDev = process.env.NODE_ENV === "development";

  // Strict CSP. No external scripts are loaded by this app — payments go through
  // a server-side redirect to Xendit, Supabase is called server-side, and fonts
  // are self-hosted via next/font — so we can keep script-src locked to nonces.
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // 'unsafe-inline' on style-src is required for Tailwind / Next.js style injection.
    // CSP still blocks inline *scripts* without a nonce, so this is safe.
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
    // Images: data: (canvas-compressed uploads), blob: (object URLs), https: (Supabase storage / Xendit receipts).
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    // Supabase REST/Auth calls (https://*.supabase.co) and realtime (*.supabase.in).
    "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  return {
    "Content-Security-Policy": csp,
    // Defense in depth alongside CSP frame-ancestors for older browsers.
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // Lock down browser features the storefront never needs.
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    // Cross-Origin Isolation hardening (locks shared buffer / DOM access).
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}
