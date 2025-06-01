import { defineConfig } from "vite";

export default defineConfig({
	base: "/clients/fj-admin-html/",
	build: {
		outDir: "../../server/dist/clients/fj-admin-html",
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
