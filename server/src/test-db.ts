
import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing");

console.log("Connecting to:", url.replace(/:[^:]*@/, ":***@")); // Log masked URL

const sql = neon(url);

async function main() {
  try {
    console.log("Testing connection...");
    const now = await sql`SELECT now()`;
    console.log("Connection successful:", now);

    console.log("Checking for transactions table...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'transactions';
    `;
    
    if (tables.length === 0) {
      console.error("❌ 'transactions' table NOT found in public schema.");
    } else {
      console.log("✅ 'transactions' table found.");
    }
    
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

main();
