// load environment variables as specified in schema or use command line variables

import path from "node:path";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
	args: Bun.argv.splice(2),
	options: {
		competitionPath: {
			type: "string",
			short: "c",
			default: Bun.env.COMPETITION_PATH,
		},
		databaseUrl: {
			type: "string",
			short: "d",
			default: Bun.env.DATABASE_URL,
		},
	},
	strict: true,
	allowPositionals: true,
});

const competitionPath = values.competitionPath ?? positionals[0];

if (!competitionPath) {
	console.error(
		"No competition path specified. Use --competitionPath or set COMPETITION_PATH.",
	);
	process.exit(1);
}

export const competitionRoot = path.resolve(competitionPath);

export const databaseUrl = values.databaseUrl
	? path.resolve(values.databaseUrl)
	: path.join(competitionRoot, "comp.db");

console.log(
	`Using competition path: ${competitionRoot}\nUsing database path: ${databaseUrl}`,
);
