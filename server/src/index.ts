import { hc } from "hono/client";
import app from "./app.ts";
import { websocket } from "./websocket.ts";

export default {
	fetch: app.fetch,
	websocket,
	port: 1989,
};
