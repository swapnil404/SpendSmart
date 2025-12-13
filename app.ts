import { Hono } from "hono";
import { logger } from "hono/logger";
import { expensesRoute } from "./expenses";
const app = new Hono();

app.use("*", logger());
app.get("/test", (c) => c.text("Hono!"));

app.route("/api/expenses", expensesRoute);
export default app;
