import { Hono } from "hono";
import { logger } from "hono/logger";
import { z } from "zod";
import { db } from "./db/db";
import { transactionsTable } from "./db/schema";
import { desc, eq, sql, and } from "drizzle-orm";

const expensesRoute = new Hono();

expensesRoute.use("*", logger());

const expensePostSchema = z.object({
  amount: z.number().positive(),
  date: z.string().length(10), 
  categoryId: z.string().min(1),
  paymentMethod: z.enum(['cash', 'upi', 'card', 'netbanking']),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
});

import { auth } from "./auth"; 

expensesRoute.get("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const transactions = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.userId, session.user.id))
    .orderBy(desc(transactionsTable.date));
  
  return c.json({ expense: transactions });
});

expensesRoute.get("/total-spent", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const result = await db.select({
    total: sql<number>`sum(${transactionsTable.amount})`
  }).from(transactionsTable)
  .where(eq(transactionsTable.userId, session.user.id));
  
  const total = result[0]?.total || 0;
  return c.json({ total });
})

expensesRoute.post("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const data = await c.req.json();
  const validatedData = expensePostSchema.parse(data);
  
  const [newTransaction] = await db.insert(transactionsTable).values({
    ...validatedData,
    userId: session.user.id
  }).returning();
  
  return c.json({ expense: newTransaction });
});

expensesRoute.get("/:id{[0-9]+}", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const id = Number.parseInt(c.req.param("id"));
  const [transaction] = await db.select().from(transactionsTable).where(
    and(
        eq(transactionsTable.id, id),
        eq(transactionsTable.userId, session.user.id)
    )
  );
  
  if (!transaction) {
    return c.notFound();
  } else {
    return c.json({ expense: transaction });
  }
});

expensesRoute.delete("/:id{[0-9]+}", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const id = Number.parseInt(c.req.param("id"));
  
  const [deleted] = await db.delete(transactionsTable).where(
    and(
        eq(transactionsTable.id, id),
        eq(transactionsTable.userId, session.user.id)
    )
  ).returning();
  
  if (!deleted) {
    return c.json({ error: "Transaction not found" }, 404);
  }
  
  return c.json({ success: true, deleted });
});

import { categoriesTable } from "./db/schema";

expensesRoute.get("/categories", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const categories = await db.select().from(categoriesTable)
    .where(eq(categoriesTable.userId, session.user.id))
    .orderBy(desc(categoriesTable.createdAt));
  return c.json({ categories });
});

expensesRoute.post("/categories", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const data = await c.req.json();
  if (!data.name) return c.json({ error: "Name is required" }, 400);

  const [newCategory] = await db.insert(categoriesTable).values({
    id: crypto.randomUUID(),
    name: data.name,
    color: data.color,
    icon: data.icon,
    userId: session.user.id
  }).returning();
  
  return c.json({ category: newCategory });
});

import { budgetsTable } from "./db/schema";

expensesRoute.get("/budget", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const [budget] = await db.select().from(budgetsTable)
    .where(eq(budgetsTable.userId, session.user.id));
    
  if (!budget) {
      return c.json({ budget: null });
  }

  return c.json({ 
      budget: {
          totalMonthly: budget.totalMonthly,
          categoryBudgets: JSON.parse(budget.categoryBudgets)
      }
  });
});

expensesRoute.post("/budget", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const data = await c.req.json();
  const { totalMonthly, categoryBudgets } = data;

  const [existingBudget] = await db.select().from(budgetsTable)
    .where(eq(budgetsTable.userId, session.user.id));

  let savedBudget;
  if (existingBudget) {
      [savedBudget] = await db.update(budgetsTable)
        .set({
            totalMonthly,
            categoryBudgets: JSON.stringify(categoryBudgets),
            updatedAt: new Date()
        })
        .where(eq(budgetsTable.id, existingBudget.id))
        .returning();
  } else {
      [savedBudget] = await db.insert(budgetsTable).values({
          id: crypto.randomUUID(),
          userId: session.user.id,
          totalMonthly,
          categoryBudgets: JSON.stringify(categoryBudgets)
      }).returning();
  }
  
  return c.json({ 
      budget: {
          totalMonthly: savedBudget.totalMonthly,
          categoryBudgets: JSON.parse(savedBudget.categoryBudgets)
      }
  });
});

export { expensesRoute };
