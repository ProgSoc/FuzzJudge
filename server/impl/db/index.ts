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

import { compress, decompress } from "@bokuweb/zstd-wasm";
import { BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./schema.ts";
import path from "path";
import { and, eq, isNotNull } from "drizzle-orm";
import type { FuzzJudgeProblemSet } from "impl/comp.ts";
import { ee } from "impl/ee.ts";
import { fileURLToPath } from "bun";
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

export const createCompetitionDB = (url: string, problems: FuzzJudgeProblemSet) => {
  const db = drizzle(url, { schema });

  function encStr(input: string) {
    return Buffer.from(compress(new TextEncoder().encode(input)));
  }

  function decStr(input: Buffer) {
    return new TextDecoder().decode(decompress(input));
  }

  

  

  

  

  

  

  async function basicAuth({ logn, pass }: { logn: string; pass: Uint8Array }): Promise<schema.User | null> {
    // const user = db.queryEntries<User>("SELECT * FROM user WHERE logn = :logn", { logn })[0] ?? null;
    const user = await db.query.userTable.findFirst({
      where: (table) => eq(table.logn, logn),
    });

    if (!user) return null;
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array([...pass, ...user.salt])));
    // Password reset mode, overwrite with new password.
    if (user.hash === null) {
      // db.query("UPDATE user SET hash = :hash WHERE id = :id", { hash, id: user.id });
      db.update(schema.userTable).set({ hash }).where(eq(schema.userTable.id, user.id)).returning();
      user.hash = hash;
    }
    // normal authentication flow
    else {
      let matches = true;
      // SECURITY: scan full list to avoid any potential side-channel
      for (let i = 0; i < hash.length; ++i) if (hash[i] !== (user.hash as Uint8Array<ArrayBuffer>)[i]) matches = false;
      if (!matches) return null;
    }
    return user;
  }


  /** @deprecated */
  async function oldScoreboard(): Promise<string> {
    let out = "username, points, solved\n";
    for (const { id: team, name } of await allTeams()) {
      const solved = [...(await solvedSet({ team }))].join(", ");
      out += `${name}, ${score({ team })}${solved ? ", " + solved : ""}\n`;
    }
    return out;
  }

  return {
    db,
 
    basicAuth,
   
    oldScoreboard,
  };
};

export type CompetitionDB = ReturnType<typeof createCompetitionDB>;
