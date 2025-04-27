import { hc as honoClient } from "hono/client";
import type { v2Router } from "./routers/v2.router";

const untypedClient = honoClient<typeof v2Router>("");
export type Client = typeof untypedClient;

export const hc = (...args: Parameters<typeof honoClient>): Client =>
	honoClient<typeof v2Router>(...args);

export type { InferResponseType } from "hono/client";
