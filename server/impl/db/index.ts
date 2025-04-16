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
import { BunSQLiteDatabase, drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from './schema.ts'
import path from "path";
import { and, eq, isNotNull } from "drizzle-orm";
import type { FuzzJudgeProblemSet } from "impl/comp.ts";
import { ee } from "impl/ee.ts";
import { fileURLToPath } from "bun";

interface SubmissionParams extends Omit<schema.Submission, "out" | "code" | "vler"> {
  out: string,
  code: string,
  vler: string,
}
export const createCompetitionDB = (url: string, problems: FuzzJudgeProblemSet) => {
  const db = drizzle(url, { schema});

  console.log("Migrations folder:", './migrations');

  migrate(db, {
    migrationsFolder: "./migrations"
  });

  function encStr(input: string) {
    return Buffer.from(compress(new TextEncoder().encode(input)));
  }

  function decStr(input: Buffer) {
    return new TextDecoder().decode(decompress(input));
  }

  async function getOrSetDefaultMeta<T extends string | undefined>(
    key: string,
    defaultValue?: T,
  ): Promise<T extends undefined ? string | null : string> {
    // const value = db.query("SELECT val FROM comp WHERE key = ?").(key)[0]?.[0];
    const value = await db.query.compTable.findFirst({
      where: (table) => eq(table.key, key),
    })

    if (value === undefined && defaultValue !== undefined) {
      // db.query("INSERT INTO comp VALUES (?, ?)", [key, defaultValue]);
      const [defVal] = await db.insert(schema.compTable).values({ key, val: defaultValue }).returning().onConflictDoNothing();
      return defVal.val as T extends undefined ? string | null : string;
    }
    return value?.val as T extends undefined ? string | null : string;
  }

  async function setMeta(key: string, value: string): Promise<string> {
    await db.insert(schema.compTable).values({ key, val: value }).onConflictDoUpdate({
      set: {
        val: value,
      },
      target: [schema.compTable.key]
    })


    return value;
  }

  async function allMeta() {
    const allCompetitions = await db.query.compTable.findMany();

    return Object.fromEntries(allCompetitions.map((comp) => [comp.key, comp.val] as [string, string]));
  }

  async function user(id: number): Promise<schema.User | undefined> {
    // return db.queryEntries<User>("SELECT * FROM user WHERE id = ?", [id])[0];

    const user = await db.query.userTable.findFirst({
      where: (table) => eq(table.id, id),
    });

    return user
  }

  async function userTeam(id: number): Promise<schema.Team | undefined> {
    const user = await db.query.userTable.findFirst({
      where: (table) => eq(table.id, id),
    })
    const teamId = user?.team;
    if (!teamId) return undefined;
    const team = await db.query.teamTable.findFirst({
      where: (table) => eq(table.id, teamId),
    })
    return team;
  }

  async function allUsers(): Promise<schema.User[]> {
    const users = await db.query.userTable.findMany();

    return users;
  }

  async function createTeam({ name }: { name: string}): Promise<schema.Team> {
    const seed = [...crypto.getRandomValues(new Uint8Array(8))].map((v) => v.toString(16).padStart(2, "0")).join("");

    const [team] = await db.insert(schema.teamTable).values({ seed, name }).returning().onConflictDoNothing();

    if (!team) throw new Error("Failed to create team");

    return team;
  }

  async function patchTeam(id: number, { name }: {name: string}): Promise<schema.Team | undefined> {
    // return db.queryEntries<Team>(
    //   `
    //     UPDATE team SET name = :name WHERE id = :id
    //     RETURNING *
    //   `,
    //   { id, name },
    // )[0];

    const [team] = await db.update(schema.teamTable).set({ name }).where(eq(schema.teamTable.id, id)).returning()

    if (!team) throw new Error("Failed to update team");

    return team;
  }

  async function deleteTeam(id: number) {
    await db.delete(schema.teamTable).where(eq(schema.teamTable.id, id));
  }

  async function assignUserTeam({ user = null as number | null, team = null as number | null }) {
    // db.query("UPDATE user SET team = :team WHERE id = :user", { team, user });

    if (user === null) return;

    db.update(schema.userTable).set({ team }).where(eq(schema.userTable.id, user)).returning()
  }

  async function resetUser(params: { logn: string; role: schema.UserRoles }, resetPassword = true): Promise<schema.User> {
    // return db.queryEntries<User>(
    //   `
    //     INSERT INTO user VALUES (NULL, NULL, :logn, :salt, NULL, :logn, :role)
    //     ON CONFLICT DO UPDATE SET role = :role${resetPassword ? ", hash = NULL" : ""}
    //     RETURNING *
    //   `,
    //   {
    //     ...params,
    //     salt: crypto.getRandomValues(new Uint8Array(32)),
    //   },
    // )[0];

    const [updatedUser] = await db.insert(schema.userTable).values({
      logn: params.logn,
      salt:  Buffer.from(crypto.getRandomValues(new Uint8Array(32)).buffer),
      role: params.role,
    }).onConflictDoUpdate({
      set: {
        role: params.role,
        ...(resetPassword ? { hash: null } : {}),
      },
      target: [schema.userTable.logn]
    }).returning()

    if (!updatedUser) throw new Error("Failed to reset user");

    return updatedUser;
  }

  async function patchUser(id: number, params: Record<string, unknown>): Promise<schema.User | undefined> {
    // return db.queryEntries<User>(
    //   `
    //   UPDATE user
    //   SET (${Object.keys(params).join(", ")}) = (${Object.keys(params).map(v => `:${v}`).join(", ")})
    //   WHERE id = :id
    //   RETURNING *
    //   `,
    //   { id, ...params },
    // )[0];

    const [updatedUser] = await db.update(schema.userTable).set(params).where(eq(schema.userTable.id, id)).returning()

    if (!updatedUser) throw new Error("Failed to update user");

    return updatedUser;
  }

  async function deleteUser(id: number) {
    // db.query("DELETE FROM user WHERE id = :id", { id });

    const [deletedUser] = await db.delete(schema.userTable).where(eq(schema.userTable.id, id)).returning()

    if (!deletedUser) throw new Error("Failed to delete user");

    return deletedUser;
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
      db.update(schema.userTable).set({ hash }).where(eq(schema.userTable.id, user.id)).returning()
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

  async function allTeams(): Promise<schema.Team[]> {
    return db.query.teamTable.findMany()
  }

  async function attempts(params: { team: number; prob: string }): Promise<number> {
    // return db.query<[number]>("SELECT COUNT(*) FROM subm WHERE team = :team AND prob = :prob", params)[0][0];
    const attempts = await db.query.submissionTable.findMany({
      where: (table, { and}) => and(eq(table.team, params.team) , eq(table.prob, params.prob)),
    })

    return attempts.length;
  }

  async function solved(params: { team: number; prob: string }): Promise<boolean> {
    // return (
    //   db.query<[number]>(
    //     "SELECT COUNT(*) FROM subm WHERE ok = TRUE AND team = :team AND prob = :prob",
    //     params,
    //   )[0][0] > 0
    // );

    const solved = await db.query.submissionTable.findFirst({
      where: (table, { and }) => and(eq(table.team, params.team), eq(table.prob, params.prob), eq(table.ok, true)),
    })

    return solved !== null;
  }

  async function solvedSet(params: { team: number }): Promise<Set<string>> {
    // return new Set(
    //   db.query<[string]>("SELECT DISTINCT prob FROM subm WHERE ok = TRUE AND team = :team", params).flat(),
    // );
    const solved = await db.selectDistinct({prob: schema.submissionTable.prob}).from(schema.submissionTable).where(and(
      eq(schema.submissionTable.team, params.team),
      eq(schema.submissionTable.ok, true),
      isNotNull(schema.submissionTable.prob),
    ))

    return new Set(solved.filter(Boolean).map(v => v.prob as string));
  }

  async  function score(params: { team: number }): Promise<number> {
    let total = 0;
    for (const slug of await solvedSet(params)) {
      total += Object(problems.get(slug)!.doc.front)?.problem?.points ?? 0;
    }
    return total;
  }

  async function manualJudge(id: number, ok: boolean) {
    // db.query("UPDATE subm SET ok = :ok WHERE id = :id", {id, ok});
    return await db.update(schema.submissionTable).set({ ok }).where(eq(schema.submissionTable.id, id)).returning()
  }

  

  async function postSubmission({ code, ok, out, prob, team, time, vler, vlms }: Omit<SubmissionParams, "id">, resubmit = false): Promise<number> {
    if (resubmit && ok) {

      if (!prob || !team) throw new Error("Missing prob or team for resubmit");
      // db.query<[number]>(
      //   `
      //     UPDATE subm SET (out, code, vler, vlms) = (:out, :code, :vler, :vlms)
      //     WHERE prob = :prob AND team = :team AND ok = TRUE
      //     RETURNING id
      //   `,
      //   { out: encStr(out), code: encStr(code), vler: encStr(vler), vlms, prob, team },
      // );
      const [id] = await db.update(schema.submissionTable).set({
        out: Buffer.from(encStr(out)),
        code: Buffer.from(encStr(code)),
        vler: Buffer.from(encStr(vler)),
        vlms,
      }).where(and(
        eq(schema.submissionTable.prob, prob),
        eq(schema.submissionTable.team, team),
        eq(schema.submissionTable.ok, true),
      )).returning()

      if (!id) throw new Error("Failed to update submission");

      return id.id;
    }
    // const id = db.query<[number]>(
    //   "INSERT INTO subm VALUES (NULL, :team, :prob, :time, :out, :code, :ok, :vler, :vlms) RETURNING id",
    //   {
    //     ok, prob, team, time, vlms,
    //     out: encStr(out),
    //     code: encStr(code),
    //     vler: encStr(vler),
    //   },
    // )[0][0];

    const [newSub] = await db.insert(schema.submissionTable).values({
      team,
      prob,
      time,
      out: Buffer.from(encStr(out)),
      code: Buffer.from(encStr(code)),
      ok,
      vler: Buffer.from(encStr(vler)),
      vlms,
    }).returning().onConflictDoNothing()

    if (!newSub) throw new Error("Failed to insert submission");

    const id = newSub.id;

    ee.emit("scoreboardUpdate") // trigger a scoreboard update
    return id;
  }

  async function getSubmissionSkeletons(teamId: number, problemId: string) {
    // return db
    //   .queryEntries<Submission>("SELECT id, team, prob, time, ok FROM subm WHERE team = ? AND prob = ?", [
    //     teamId,
    //     problemId,
    //   ])
    //   .map((v: any) => {
    //     v.time = new Date(v.time);
    //     return v;
    //   });

    const submissions = await db.query.submissionTable.findMany({
      where: (table, { and }) => and(eq(table.team, teamId), eq(table.prob, problemId)),
    })

    return submissions.map((v) => {
      return {
        id: v.id,
        team: v.team,
        prob: v.prob,
        time: new Date(v.time),
        ok: v.ok,
      }
    })
  }

  async function getSubmissionOut(id: number): Promise<string | undefined> {
    // const data = db.query<[Uint8Array]>("SELECT out FROM subm WHERE id = :id", { id })[0]?.[0];
    const data = await db.query.submissionTable.findFirst({
      where: (table) => eq(table.id, id),
    })
    if (!data) return;

    return decStr(data.out);
  }

  async function getSubmissionCode(id: number): Promise<string | undefined> {
    // const data = db.query<[Uint8Array]>("SELECT code FROM subm WHERE id = :id", { id })[0]?.[0];
    const data = await db.query.submissionTable.findFirst({
      where: (table) => eq(table.id, id),
    })
    if (!data?.code) return;
    return decStr(data.code);
  }

  async function getSubmissionVler(id: number): Promise<string | undefined> {
    // const data = db.query<[Uint8Array]>("SELECT vler FROM subm WHERE id = :id", { id })[0]?.[0];
    const data = await db.query.submissionTable.findFirst({
      where: (table) => eq(table.id, id),
    })
    if (!data?.vler) return;
    return decStr(data.vler);
  }

  /** @deprecated */
  async function oldScoreboard(): Promise<string> {
    let out = "username, points, solved\n";
    for (const { id: team, name } of await allTeams()) {
      const solved = [...await solvedSet({ team })].join(", ");
      out += `${name}, ${score({ team })}${solved ? ", " + solved : ""}\n`;
    }
    return out;
  }

  return {
    db,
    allMeta,
    getOrSetDefaultMeta,
    setMeta,
    user,
    userTeam,
    allUsers,
    createTeam,
    patchTeam,
    deleteTeam,
    assignUserTeam,
    resetUser,
    patchUser,
    deleteUser,
    basicAuth,
    allTeams,
    attempts,
    solved,
    solvedSet,
    score,
    manualJudge,
    postSubmission,
    getSubmissionSkeletons,
    getSubmissionOut,
    getSubmissionCode,
    getSubmissionVler,
    oldScoreboard
  }
}

export type CompetitionDB = ReturnType<typeof createCompetitionDB>;