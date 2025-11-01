import crypto from "crypto";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function hashApiKey(plain: string): Promise<string> {
  return await bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyApiKey(
  plain: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}

export function keyPrefix(plain: string): string {
  return plain.substring(0, 15);
}
