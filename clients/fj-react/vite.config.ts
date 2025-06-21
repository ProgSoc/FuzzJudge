import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import codegen from "vite-plugin-graphql-codegen";
import tsconfigPaths from "vite-tsconfig-paths";

const ReactCompilerConfig = {
	target: "19", // '17' | '18' | '19'
};

// https://vite.dev/config/
export default defineConfig({
	base: "/clients/fj-react/",
	plugins: [
		tsconfigPaths(),
		codegen(),
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		react({
			babel: {
				plugins: [
					["babel-plugin-react-compiler", ReactCompilerConfig],
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
