import { Hono } from "hono";
import { logger } from "hono/logger";
const expensesRoute = new Hono();

expensesRoute.use("*", logger()); 

expensesRoute.get("/", (c) => {
    return c.json({expense:[]});
})
expensesRoute.post("/", async (c) => {
    const expense = await c.req.json();
    return c.json({ message: "Expense created", expense }, 201);
});

export { expensesRoute };