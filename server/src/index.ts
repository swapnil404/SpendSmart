import { Hono } from "hono";
import { expensesRoute } from "./expenses";
import { logger } from "hono/logger";
import { db } from "./db/db";


import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());
app.use("*", logger());

app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: "Internal Server Error" }, 500);
});

const welcomeStrings = [
  `Hello Hono from Bun ${process.versions.bun}!`,
  "To learn more about Hono + Bun on Vercel, visit https://vercel.com/docs/frameworks/backend/hono",
];

app.get("/", (c) => {
  return c.text(welcomeStrings.join("\n\n"));
});

if (!process.env.VERCEL) {
  Bun.serve({
    fetch: app.fetch,
    port: 3001,
  });
}

app.use("*", logger());
app.get("/test", (c) => c.text("Hono!"));

app.route("/api/expenses", expensesRoute);

console.log("server running");

export default app;
