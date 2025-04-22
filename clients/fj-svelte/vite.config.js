import { resolve } from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
export default defineConfig({
	base: "",
	plugins: [svelte(), tsconfigPaths()],
	build: {
		sourcemap: "inline",
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
				scoreboard: resolve(__dirname, "scoreboard/index.html"),
			},
		},
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:1989",
				changeOrigin: true,
				ws: true,
				rewrite: (path) => path.replace(/^\/api/, ""), // remove /api prefix
			},
		},
	},
});
