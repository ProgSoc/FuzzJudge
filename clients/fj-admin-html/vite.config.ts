import { defineConfig } from "vite";

export default defineConfig({
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
