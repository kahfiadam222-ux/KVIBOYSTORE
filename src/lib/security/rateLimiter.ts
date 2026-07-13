// Lightweight in-memory rate limiter for auth endpoints.
//
// CAVEAT: On Vercel (serverless), each function instance keeps its own counter,
// so this is a best-effort first line of defense rather than a globally accurate
// limiter. For high-volume abuse protection, migrate to Vercel KV / Upstash
// Redis with a shared store. For an MVP storefront this is sufficient: it still
// slows down brute-force attempts within a single warm instance.

const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  /** false means the action is currently blocked. */
  allowed: boolean;
  /** attempts remaining this window (0 when blocked). */
  remaining: number;
  /** ms until the window resets and the limit is lifted. */
  resetIn: number;
}

/**
 * Check (and record) an attempt for the given identifier.
 *
 * @param identifier  a stable key, e.g. `login:user@example.com`
 * @param maxAttempts how many attempts are permitted inside the window
 * @param windowMs    length of the sliding-ish window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const record = buckets.get(identifier);

  if (!record || now > record.resetAt) {
    // Fresh window — first attempt.
    buckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetIn: windowMs };
  }

  if (record.count >= maxAttempts) {
    // Over the limit — do NOT increment, just report the lockout.
    return { allowed: false, remaining: 0, resetIn: record.resetAt - now };
  }

  // Under the limit — count this attempt.
  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count, resetIn: record.resetAt - now };
}

// Periodically evict expired buckets so the map can't grow unbounded.
// Wrapped in try/catch so this file stays safe to import in any runtime.
try {
  if (typeof setInterval !== "undefined") {
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of buckets.entries()) {
        // Expired + a 60s grace period, then drop it.
        if (now > record.resetAt + 60_000) {
          buckets.delete(key);
        }
      }
    }, 5 * 60_000).unref?.();
  }
} catch {
  // no-op — interval setup is optional
}
