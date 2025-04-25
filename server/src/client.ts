import { hc as honoClient } from "hono/client";
import type app from "./app";

const untypedClient = honoClient<typeof app>("");
export type Client = typeof untypedClient;

export const hc = (...args: Parameters<typeof honoClient>): Client =>
	honoClient<typeof app>(...args);
