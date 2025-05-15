import type { CodegenConfig } from "@graphql-codegen/cli";
import { GraphQLDateTime } from "graphql-scalars";

const config: CodegenConfig = {
	schema: "http://localhost:1989/graphql",
	documents: [
		"src/**/*.gql",
		"src/**/*.graphql",
		"src/**/*.svelte",
		"src/**/*.ts",
	],
	generates: {
		"./src/gql/index.ts": {
			plugins: [
				"typescript",
				"typescript-operations",
				"typescript-graphql-request",
			],
			config: {
				scalars: {
					DateTime: "Date | string",
					File: "File",
				},
				rawRequest: true,
				documentMode: "string",
			},
		},
	},
};
export default config;
