import express from "express";
import { sql } from "../database/db";
import { keyPrefix, verifyApiKey } from "../utils/apiKey";

const router = express.Router();

/**
 * GET /api/client/details
 * Header: Authorization: Bearer <API_KEY>
 * Returns client info if API key is valid, active, and not expired.
 */
router.get("/details", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(401).json({ error: "Missing Authorization header" });

    const parts = (authHeader as string).split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ error: "Bad Authorization header format" });
    }

    const providedKey = parts[1].trim();
    if (!providedKey) return res.status(401).json({ error: "Empty API key" });

    // Quick filter by prefix to reduce rows to verify
    const prefix = keyPrefix(providedKey);

    // Expire any outdated keys before checking
    await sql`UPDATE api_keys SET status = 'expired', updated_at = now()
              WHERE expiry_date IS NOT NULL AND expiry_date < now() AND status != 'expired'`;

    // Find matching candidate keys by prefix
    const candidates = await sql`
      SELECT ak.*, c.name AS client_name, c.email AS client_email, c.organization
      FROM api_keys ak
      JOIN clients c ON c.id = ak.client_id
      WHERE ak.key_prefix = ${prefix}
    `;

    if (!candidates || candidates.length === 0) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Try to match via bcrypt (only one should match)
    for (const row of candidates) {
      const ok = await verifyApiKey(providedKey, row.key_hash);
      if (!ok) continue;

      // Check status & dates
      if (row.status !== "active")
        return res.status(403).json({ error: "API key inactive" });

      const now = new Date();
      const startDate = row.start_date ? new Date(row.start_date) : null;
      const expiryDate = row.expiry_date ? new Date(row.expiry_date) : null;
      if (startDate && now < startDate)
        return res.status(403).json({ error: "API key not yet active" });
      if (expiryDate && now > expiryDate)
        return res.status(403).json({ error: "API key expired" });

      // Return client details (safe subset)
      const client = {
        id: row.client_id,
        name: row.client_name,
        email: row.client_email,
        organization: row.organization,
      };
      return res.json({ client });
    }

    return res.status(401).json({ error: "Invalid API key" });
  } catch (err) {
    console.error("Public endpoint error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
