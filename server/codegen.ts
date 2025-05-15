import { defineConfig } from "@eddeee888/gcg-typescript-resolver-files";
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "**/schema.graphql",
	hooks: {
		afterAllFileWrite: ["cd ../ && bun run biome check --write ./server/"],
	},
	generates: {
		"src/schema": defineConfig({
			// The following config is designed to work with GraphQL Yoga's File uploads feature
			// https://the-guild.dev/graphql/yoga-server/docs/features/file-uploads
			scalarsOverrides: {
				File: { type: "File" },
			},
			typesPluginsConfig: {
				contextType: "@/context#GraphQLContext",
				namingConvention: {
					enumValues: "change-case-all#lowerCase",
				},
			},
			resolverGeneration: {
				query: "*",
				mutation: "*",
				subscription: "*",
				scalar: "!*.File",
				object: "*",
				union: "",
				interface: "",
				enum: "",
			},
		}),
	},
};
export default config;
