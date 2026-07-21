import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";
const PREFIX = "enc:v1:";

function deriveKey(): Buffer {
  const secret =
    process.env.DELIVERY_PAYLOAD_SECRET ||
    process.env.XENDIT_WEBHOOK_TOKEN ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "kviboystore-dev-only-insecure-key";
  return createHash("sha256").update(secret).digest();
}

/** Encrypt delivery credentials for storage. Plaintext is never stored when this is used. */
export function encryptPayload(plaintext: string): string {
  if (!plaintext) return plaintext;
  // Already encrypted (idempotent)
  if (plaintext.startsWith(PREFIX)) return plaintext;

  const key = deriveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  const packed = Buffer.concat([iv, tag, encrypted]).toString("base64url");
  return `${PREFIX}${packed}`;
}

/** Decrypt for authorized buyer display. Returns original string if not encrypted (legacy rows). */
export function decryptPayload(stored: string): string {
  if (!stored || !stored.startsWith(PREFIX)) return stored;

  try {
    const packed = Buffer.from(stored.slice(PREFIX.length), "base64url");
    const iv = packed.subarray(0, 12);
    const tag = packed.subarray(12, 28);
    const data = packed.subarray(28);
    const key = deriveKey();
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return stored;
  }
}
