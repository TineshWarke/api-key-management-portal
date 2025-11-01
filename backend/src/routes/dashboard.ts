import express from "express";
import { sql } from "../database/db";
import { authenticateToken } from "../middleware/auth";
import { markExpiredKeys } from "../utils/expiryCheck";

const router = express.Router();

/**
 * @route GET /api/dashboard/metrics
 * Returns total clients, active keys, inactive keys.
 */
router.get("/metrics", authenticateToken, async (_req, res) => {
  try {
    await markExpiredKeys()
    const totalClients = await sql`SELECT COUNT(*) FROM clients`;
    const activeKeys =
      await sql`SELECT COUNT(*) FROM api_keys WHERE status = 'active'`;
    const inactiveKeys =
      await sql`SELECT COUNT(*) FROM api_keys WHERE status = 'inactive'`;

    res.json({
      totalClients: Number(totalClients[0].count),
      activeKeys: Number(activeKeys[0].count),
      inactiveKeys: Number(inactiveKeys[0].count),
    });
  } catch (err) {
    console.error("Dashboard metrics error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
