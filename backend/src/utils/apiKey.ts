import crypto from "crypto";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Generate a secure API key string.
 * This returns the plain key — store ONLY the hashed value in DB.
 */
export function generateApiKey(): string {
  // 32 bytes -> 64 hex characters
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a plain API key with bcrypt.
 */
export async function hashApiKey(plain: string): Promise<string> {
  return await bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Compare a plain API key to a stored hash.
 */
export async function verifyApiKey(
  plain: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}

/**
 * Store a short prefix in DB to speed up lookup.
 * Use the first 15 characters; enough entropy to limit candidate rows.
 */
export function keyPrefix(plain: string): string {
  return plain.substring(0, 15);
}
