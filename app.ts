import { Hono } from "hono";
import { logger } from "hono/logger";
const app = new Hono();

app.use("*", logger());
app.get("/test", (c) => c.text("Hono!"));

export default app;
