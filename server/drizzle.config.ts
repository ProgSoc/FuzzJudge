import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
config();
export default defineConfig({
	dialect: "sqlite",
	schema: "./src/db/schema.ts",
	out: "./migrations",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
});
