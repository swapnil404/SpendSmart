import { db } from "../db/db";
import { sql } from "drizzle-orm";
import { budgetsTable, categoriesTable, transactionsTable } from "../db/schemas/expenses";
import { session, account, user, verification } from "../db/schemas/auth";

async function clearDatabase() {
  console.log("🧹 Clearing database...");

  try {
    // Order matters due to foreign key constraints
    console.log("- Clearing transactions...");
    await db.execute(sql`TRUNCATE TABLE ${transactionsTable} RESTART IDENTITY CASCADE`);
    
    console.log("- Clearing categories...");
    await db.execute(sql`TRUNCATE TABLE ${categoriesTable} RESTART IDENTITY CASCADE`);
    
    console.log("- Clearing budgets...");
    await db.execute(sql`TRUNCATE TABLE ${budgetsTable} RESTART IDENTITY CASCADE`);
    
    console.log("- Clearing sessions...");
    await db.execute(sql`TRUNCATE TABLE ${session} RESTART IDENTITY CASCADE`);
    
    console.log("- Clearing accounts...");
    await db.execute(sql`TRUNCATE TABLE ${account} RESTART IDENTITY CASCADE`);
    
    console.log("- Clearing verifications...");
    await db.execute(sql`TRUNCATE TABLE ${verification} RESTART IDENTITY CASCADE`);

    console.log("- Clearing users...");
    await db.execute(sql`TRUNCATE TABLE ${user} RESTART IDENTITY CASCADE`);

    console.log("✅ Database cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
}

clearDatabase();
