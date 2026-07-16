import { timingSafeEqual } from "crypto";

/**
 * Compare two secrets in constant time to avoid timing side-channels.
 * Returns false if either side is missing or lengths differ.
 */
export function safeEqualSecret(
  provided: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!provided || !expected) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}
