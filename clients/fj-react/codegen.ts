import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "../../server/src/schema/schema.generated.graphqls",
	documents: ["src/**/*.gql", "src/**/*.graphql"],
	generates: {
		"./src/gql/index.ts": {
			plugins: [
				"typescript",
				"typescript-operations",
				"typescript-graphql-request",
			],
			config: {
				useTypeImports: true,
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
