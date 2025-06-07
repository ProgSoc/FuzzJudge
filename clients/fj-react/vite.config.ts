import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import codegen from "vite-plugin-graphql-codegen";

// https://vite.dev/config/
export default defineConfig({
	base: "/clients/fj-react/",
	plugins: [
		codegen(),
		TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
		react({
			babel: {
				plugins: [
					[
						"@emotion/babel-plugin",
						{
							importMap: {
								"@mui/system": {
									styled: {
										canonicalImport: ["@emotion/styled", "default"],
										styledBaseImport: ["@mui/system", "styled"],
									},
								},
								"@mui/material": {
									styled: {
										canonicalImport: ["@emotion/styled", "default"],
										styledBaseImport: ["@mui/material", "styled"],
									},
								},
								"@mui/material/styles": {
									styled: {
										canonicalImport: ["@emotion/styled", "default"],
										styledBaseImport: ["@mui/material/styles", "styled"],
									},
								},
							},
						},
					],
				],
			},
		}),
	],
	build: {
		outDir: "../../server/dist/clients/fj-react",
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
