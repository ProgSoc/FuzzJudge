import path from "node:path";
import { fileURLToPath } from "bun";
import { defineConfig } from "tsdown/config";

export default defineConfig({
	entry: ["src/index.ts"],
	outDir: "dist",
	format: ["esm"],
	platform: "node",
	external: ["bun", "bun:sqlite"],
	onSuccess: async ({ watch }) => {
		const ac = new AbortController();
		const { signal } = ac;
		const projDir = path.dirname(fileURLToPath(import.meta.url));
		if (watch) {
			const proc = Bun.spawn(["bun", "run", "start"], {
				stdin: "inherit",
				stdout: "inherit",
				stderr: "inherit",
				signal,
				cwd: projDir,
			});

			process.on("SIGINT", () => {
				console.log("Stopping server...");
				ac.abort();
			});
			process.on("SIGTERM", () => {
				console.log("Stopping server...");
				ac.abort();
			});

			await proc.killed;
		}
	},
});
