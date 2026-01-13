import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === "production") {
  console.warn("DATABASE_URL is not set in production. Database operations will fail.");
}

export const db = drizzle(databaseUrl!);
