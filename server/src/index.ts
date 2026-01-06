import { Hono } from "hono";
import { expensesRoute } from "./expenses";
import { logger } from "hono/logger";

const app = new Hono();

const welcomeStrings = [
  `Hello Hono from Bun ${process.versions.bun}!`,
  "To learn more about Hono + Bun on Vercel, visit https://vercel.com/docs/frameworks/backend/hono",
];

app.get("/", (c) => {
  return c.text(welcomeStrings.join("\n\n"));
});

Bun.serve({
  fetch: app.fetch,
});

app.use("*", logger());
app.get("/test", (c) => c.text("Hono!"));

app.route("/api/expenses", expensesRoute);

console.log("server running");

export default app;
