import { sql } from "./db";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function migrate() {
  try {
    console.log("Starting migrations...");

    // Admins table
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `;

    // Clients table
    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        organization VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `;

    // API keys table
    await sql`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        key_hash VARCHAR(255) NOT NULL,
        key_prefix VARCHAR(64) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
        expiry_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `;

    console.log("Tables ensured.");

    // Create a sample admin if not present
    const admins =
      await sql`SELECT id FROM admins WHERE email = 'admin@example.com'`;
    if (!admins || admins.length === 0) {
      const pwd = "admin123";
      const hashed = await bcrypt.hash(pwd, 10);
      await sql`INSERT INTO admins (email, password, name) VALUES ('admin@example.com', ${hashed}, 'Administrator')`;
      console.log("Created sample admin: admin@example.com / admin123");
    } else {
      console.log("Sample admin already exists.");
    }

    console.log("Migration finished.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
