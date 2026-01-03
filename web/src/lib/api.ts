import { type ApiRoutes } from "../../../server/src/app";
import { hc } from "hono/client";

const client = hc<ApiRoutes>(import.meta.env.VITE_API_URL || "").replace(
  /\/$/,
  ""
);

export const api = client.api;
