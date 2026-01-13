import { Hono } from "hono";
import { expensesRoute } from "./expenses";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (origin.startsWith("http://localhost")) return origin;
      if (origin.endsWith(".swapnilchristian.dev")) return origin;
      if (origin.endsWith(".vercel.app")) return origin;
      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.use("*", logger());


app.onError((err, c) => {
  console.error("Error occurred:", err.message);
  console.error("Stack trace:", err.stack);
  return c.json({ error: "Internal Server Error", message: err.message }, 500);
});


const welcomeStrings = [
  `Hello Hono from Bun ${process.versions.bun}!`,
  "To learn more about Hono + Bun on Vercel, visit https://vercel.com/docs/frameworks/backend/hono",
];

app.get("/", (c) => {
  return c.text(welcomeStrings.join("\n\n"));
});

app.get("/test", (c) => c.text("Hono!"));

app.route("/api/expenses", expensesRoute);

console.log("server running");

if (!process.env.VERCEL) {
  Bun.serve({
    fetch: app.fetch,
    port: 3001,
  });
}

export default app;
