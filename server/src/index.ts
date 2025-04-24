import type { Serve } from "bun";
import app from "./app.ts";
import { websocket } from "./websocket.ts";

export default {
	fetch: app.fetch,
	websocket: websocket,
	port: 1989,
	// biome-ignore lint/suspicious/noExplicitAny: Bun WebSocket and Hono types are not compatible but work
} satisfies Serve<any>;
