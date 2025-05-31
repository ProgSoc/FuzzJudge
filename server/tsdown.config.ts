import path from "node:path";
import { fileURLToPath } from "bun";
import { defineConfig } from "tsdown/config";

export default defineConfig([
	{
		entry: ["src/index.ts"],
		outDir: "dist",
		format: ["esm"],
		platform: "node",
		external: ["bun", "bun:sqlite"],
		sourcemap: true,
		clean: false,
		onSuccess: async ({ watch }, signal) => {
			const procConfig = path.dirname(fileURLToPath(import.meta.url));
			if (!watch) return;

			Bun.spawn(["bun", "run", "start"], {
				signal,
				stdio: ["inherit", "inherit", "inherit"],
				cwd: procConfig,
			});
		},
	},
]);
