import app from "./app.ts";
import { websocket } from "./websocket.ts";

if (import.meta.main) {
	Bun.serve({
		fetch: app.fetch,
		websocket,
		port: 1989,
	});
}
