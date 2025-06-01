import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
	optimizeDeps: {
		exclude: ["svelte-markdown"],
	},
	base: "/clients/fj-svelte/",
	plugins: [svelte(), tsconfigPaths()],
	build: {
		sourcemap: "inline",
		outDir: "../../server/dist/clients/fj-svelte",
		emptyOutDir: true,
	},
	server: {
		proxy: {
			"/graphql": {
				target: "http://localhost:1989",
				changeOrigin: true,
				ws: true,
			},
		},
	},
});
