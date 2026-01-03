import { Hono } from "hono";
import { expensesRoute } from "./expenses";
import { logger } from "hono/logger";

export const app = new Hono();

app.use("*", logger());
app.get("/test", (c) => c.text("Hono!"));

const apiRoutes = app.basePath("/api").route("/expenses", expensesRoute);

console.log("server running");


export type ApiRoutes = typeof apiRoutes;
