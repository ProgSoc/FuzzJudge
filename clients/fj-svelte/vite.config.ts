import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
	optimizeDeps: {
		exclude: ["svelte-markdown"],
	},
	base: "",
	plugins: [svelte(), tsconfigPaths()],
	build: {
		sourcemap: "inline",
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
