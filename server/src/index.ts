#!/usr/bin/env bun

import app from "./app.ts";
import { websocket } from "./websocket.ts";

if (import.meta.main) {
	const server = Bun.serve({
		fetch: app.fetch,
		websocket,
		port: 1989,
	});

	const gracefulShutdown = async () => {
		await server.stop();
		process.exit(0);
	};

	process.on("SIGTERM", gracefulShutdown);
	process.on("SIGINT", gracefulShutdown);
	console.log(`Server running on http://localhost:${server.port}`);
}
