import { Hono } from "hono";
import { logger } from "hono/logger";
import { z } from "zod";
import {cors} from 'hono/cors';

const expensesRoute = new Hono();

expensesRoute.use("*", cors());

expensesRoute.use("*", logger());


const fakeExpenses: expense[] = [
  { id: 1, title: "Groceries", amount: 52.75 },
  { id: 2, title: "Electricity Bill", amount: 120.0 },
  { id: 3, title: "Monthly Rent", amount: 1500.0 },
  { id: 4, title: "Gym Membership", amount: 29.99 },
  { id: 5, title: "Coffee", amount: 4.5 },
];

const expenseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(100),
  amount: z.number().positive(),
});
type expense = z.infer<typeof expenseSchema>

const expensePostSchema = z.object({
  title: z.string().min(1).max(100),
  amount: z.number().positive(),
});

expensesRoute.get("/", async (c) => {
  return c.json({ expense: fakeExpenses });
});

expensesRoute.get ("/total-spent", async (c) =>{
  const total = fakeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
return c.json({ total });
})
expensesRoute.post("/", async (c) => {
  const data = await c.req.json();
  const expense = expensePostSchema.parse(data);
  fakeExpenses.push({...expense,id:fakeExpenses.length+1})
  return c.json({ expense });
});

expensesRoute.get("/:id{[0-9]+}", async (c) => {
  const id = Number.parseInt(c.req.param("id"));
  const expense = fakeExpenses.find(expense => expense.id === id);
  if (!expense){
    return c.notFound();
  }else{
  return c.json({expense});
  }
});

export { expensesRoute };
