import express from "express";
import { sql } from "../database/db";
import { authenticateToken } from "../middleware/auth";
import { generateApiKey, hashApiKey, keyPrefix } from "../utils/apiKey";
import { addDays } from "../utils/date";
import { markExpiredKeys } from "../utils/expiryCheck";

const router = express.Router();

/**
 * GET /api/clients
 * List clients with their API key status
 * Optional query params: ?search=<term>&page=1&limit=10
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    await markExpiredKeys();
    const search = (req.query.search as string) || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const hasSearch = search.trim().length > 0;
    const searchTerm = `%${search}%`;

    const clients = hasSearch
      ? await sql`
          SELECT c.id, c.name, c.email, c.organization,
                 ak.status AS api_status, ak.start_date, ak.expiry_date
          FROM clients c
          LEFT JOIN api_keys ak ON c.id = ak.client_id
          WHERE c.name ILIKE ${searchTerm}
             OR c.email ILIKE ${searchTerm}
             OR c.organization ILIKE ${searchTerm}
          ORDER BY c.id DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      : await sql`
          SELECT c.id, c.name, c.email, c.organization,
                 ak.status AS api_status, ak.start_date, ak.expiry_date
          FROM clients c
          LEFT JOIN api_keys ak ON c.id = ak.client_id
          ORDER BY c.id DESC
          LIMIT ${limit} OFFSET ${offset}
        `;

    const totalRows = hasSearch
      ? await sql`
          SELECT COUNT(*) FROM clients c
          WHERE c.name ILIKE ${searchTerm}
             OR c.email ILIKE ${searchTerm}
             OR c.organization ILIKE ${searchTerm}
        `
      : await sql`
          SELECT COUNT(*) FROM clients
        `;

    res.json({
      clients,
      pagination: {
        total: Number(totalRows[0].count),
        page,
        limit,
      },
    });
  } catch (err) {
    console.error("List clients error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/clients
 * Create new client + generate API key
 * Body: { name, email, organization?, validityDays? }
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, email, organization, validityDays } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // Ensure validityDays is a number
    const validity = Number(validityDays);
    const startDate = new Date();
    const expiryDate =
      !isNaN(validity) && validity > 0
        ? addDays(startDate, validity)
        : addDays(startDate, 30);

    // Insert client
    const inserted = await sql`
      INSERT INTO clients (name, email, organization)
      VALUES (${name}, ${email}, ${organization || null})
      RETURNING id
    `;
    const clientId = inserted[0].id;

    // Generate secure API key
    const plainKey = generateApiKey();
    const hashed = await hashApiKey(plainKey);
    const prefix = keyPrefix(plainKey);

    await sql`
      INSERT INTO api_keys (client_id, key_hash, key_prefix, status, start_date, expiry_date)
      VALUES (${clientId}, ${hashed}, ${prefix}, 'active', ${startDate}, ${expiryDate})
    `;

    res.status(201).json({
      message: "Client created successfully",
      client: { id: clientId, name, email, organization },
      apiKey: plainKey, // return only once
    });
  } catch (err) {
    console.error("Create client error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/clients/:id
 * Update client info
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const clientId = Number(req.params.id);
    const { name, email, organization } = req.body;

    const result = await sql`
      UPDATE clients
      SET name = ${name}, email = ${email}, organization = ${organization}, updated_at = now()
      WHERE id = ${clientId}
      RETURNING *
    `;

    if (result.length === 0)
      return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client updated", client: result[0] });
  } catch (err) {
    console.error("Update client error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/clients/:id/toggle
 * Toggle API key status (active/inactive)
 */
router.patch("/:id/toggle", authenticateToken, async (req, res) => {
  try {
    const clientId = Number(req.params.id);

    const keys =
      await sql`SELECT * FROM api_keys WHERE client_id = ${clientId}`;
    if (keys.length === 0)
      return res.status(404).json({ error: "API key not found" });

    const currentStatus = keys[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    await sql`
      UPDATE api_keys SET status = ${newStatus}, updated_at = now()
      WHERE client_id = ${clientId}
    `;

    res.json({ message: `API key ${newStatus}`, status: newStatus });
  } catch (err) {
    console.error("Toggle key error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/clients/:id/regenerate
 * Regenerate a new API key for a client (old one invalidated)
 */
router.post("/:id/regenerate", authenticateToken, async (req, res) => {
  try {
    const clientId = Number(req.params.id);
    const validityDays = Number(req.body.validityDays || 30);

    const plainKey = generateApiKey();
    const hashed = await hashApiKey(plainKey);
    const prefix = keyPrefix(plainKey);
    const startDate = new Date();
    const expiryDate = addDays(startDate, validityDays);

    // Invalidate existing
    await sql`UPDATE api_keys SET status = 'inactive' WHERE client_id = ${clientId}`;

    // Insert new key
    await sql`
      INSERT INTO api_keys (client_id, key_hash, key_prefix, status, start_date, expiry_date)
      VALUES (${clientId}, ${hashed}, ${prefix}, 'active', ${startDate}, ${expiryDate})
    `;

    res.json({ message: "API key regenerated", apiKey: plainKey });
  } catch (err) {
    console.error("Regenerate key error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
