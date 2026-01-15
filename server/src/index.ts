import { Hono } from "hono";
import { expensesRoute } from "./expenses";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { auth } from "./auth";

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
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposeHeaders: ["Content-Length", "Set-Cookie"],
    maxAge: 60000,
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

app.get("/api/debug-config", (c) => {
  return c.json({
    baseURL: (process.env.BETTER_AUTH_URL || process.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "") + '/api/auth',
    betterAuthUrlEnv: process.env.BETTER_AUTH_URL,
    viteApiUrlEnv: process.env.VITE_API_URL,
    gmailUser: "spendsmart.noreply@gmail.com",
    hasGmailPassword: !!process.env.GMAIL_APP_PASSWORD,
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
  });
});

app.all("/api/auth/*", (c) => {
  console.log(`Auth request: ${c.req.method} ${c.req.url}`);
  return auth.handler(c.req.raw);
});

app.route("/api/expenses", expensesRoute);

console.log("server running");

if (!process.env.VERCEL) {
  Bun.serve({
    fetch: app.fetch,
    port: 3001,
  });
}

export default app;
