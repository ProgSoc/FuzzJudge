import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "sqlite",
	schema: "./impl/db/schema.ts",
	out: "./migrations",
});
