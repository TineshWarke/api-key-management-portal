import { sql } from "../database/db";

export async function markExpiredKeys() {
  try {
    await sql`
      UPDATE api_keys
      SET status = 'expired'
      WHERE expiry_date < now() AND status != 'expired'
    `;
  } catch (err) {
    console.error("Failed to mark expired keys:", err);
  }
}
