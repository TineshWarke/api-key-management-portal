import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export const sql = neon(process.env.DATABASE_URL);

export interface Admin {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: Date;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  organization: string;
  status: "active" | "inactive";
  created_at: Date;
  updated_at: Date;
}

export interface ApiKey {
  id: number;
  client_id: number;
  key_hash: string;
  key_prefix: string;
  status: "active" | "inactive" | "expired";
  start_date: Date;
  expiry_date: Date;
  created_at: Date;
  updated_at: Date;
}
