/*
 * FuzzJudge - Randomised input judging server, designed for ProgComp.
 * Copyright (C) 2024 UTS Programmers' Society (ProgSoc)
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Database } from "bun:sqlite";
import { exists } from "node:fs/promises";
import path from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { databaseUrl } from "../config.ts";
import * as schema from "./schema.ts";

if (databaseUrl === ":memory:") {
	console.warn(
		"Using in-memory database. This will not persist across restarts.",
	);
}

/**
 * The database connection.
 */
const database = new Database(databaseUrl);

/**
 * The database query builder.
 */
const db = drizzle(database, { schema });

const topMigrationFolderExists = await exists("./migrations");

// Meta resolve
const migrationFolder = topMigrationFolderExists
	? "./migrations"
	: path.join(import.meta.dirname, "../migrations");

console.log(`Using migrations folder: ${migrationFolder} `);

migrate(db, {
	migrationsFolder: migrationFolder,
});

export { db };
