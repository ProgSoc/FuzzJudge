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


import {drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./schema.ts";
import path from "path";
import { parseArgs } from "util";


const { positionals } = parseArgs({
  args: Bun.argv,
  allowPositionals: true,
});

const pathPositional = positionals[2] ?? "./";

/**
 * The path to the competition folder.
 */
const root = path.resolve(pathPositional);

/**
 * The database connection and query builder.
 */
export const db = drizzle(path.join(root, "comp.db"), { schema });

/**
 * Performs any pending migrations.
 */
export function migrateDB() {
    migrate(db, {
    migrationsFolder: "./migrations",
  });
}
