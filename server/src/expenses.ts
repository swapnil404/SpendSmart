import { Hono } from "hono";
import { logger } from "hono/logger";
import { z } from "zod";
import { db } from "./db/db";
import { transactionsTable } from "./db/schema";
import { desc, eq, sql } from "drizzle-orm";

const expensesRoute = new Hono();

expensesRoute.use("*", logger());

const expensePostSchema = z.object({
  amount: z.number().positive(),
  date: z.string().length(10), // YYYY-MM-DD
  categoryId: z.string().min(1),
  paymentMethod: z.enum(['cash', 'upi', 'card', 'netbanking']),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
});

expensesRoute.get("/", async (c) => {
  const transactions = await db.select().from(transactionsTable).orderBy(desc(transactionsTable.date));
  return c.json({ expense: transactions });
});

expensesRoute.get("/total-spent", async (c) => {
  const result = await db.select({
    total: sql<number>`sum(${transactionsTable.amount})`
  }).from(transactionsTable);
  
  const total = result[0]?.total || 0;
  return c.json({ total });
})

expensesRoute.post("/", async (c) => {
  const data = await c.req.json();
  const validatedData = expensePostSchema.parse(data);
  
  const [newTransaction] = await db.insert(transactionsTable).values(validatedData).returning();
  
  return c.json({ expense: newTransaction });
});

expensesRoute.get("/:id{[0-9]+}", async (c) => {
  const id = Number.parseInt(c.req.param("id"));
  const [transaction] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, id));
  
  if (!transaction) {
    return c.notFound();
  } else {
    return c.json({ expense: transaction });
  }
});

export { expensesRoute };
