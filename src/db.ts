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

import { MaybeNull } from "https://deno.land/std@0.92.0/node/_utils.ts";
import { FuzzJudgeProblem, FuzzJudgeProblemSet } from "./comp.ts";
import { DB, compressZstd, decompressZstd } from "./deps.ts";
import { Subscribable } from "./util.ts";

export type Team = {
  id: number;
  seed: string;
  name: string;
};

export type UserRoles = "admin" | "competitor";

export type User = {
  id: number;
  team: number;
  logn: string;
  salt: Uint8Array;
  hash: Uint8Array;
  name: string;
  role: UserRoles;
};

export type Submission = {
  id: number;
  team: number;
  prob: string;
  time: Date;
  out: string;
  code: string;
  ok: boolean;
  vler: string;
  vlms: number;
};

export class CompetitionDB extends Subscribable<CompetitionDB> {
  #db: DB;
  #problems: FuzzJudgeProblemSet;

  constructor(path: string, problems: FuzzJudgeProblemSet) {
    super();
    this.#problems = problems;
    this.#db = new DB(path);
    this.#db.execute(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS team (
        id   INTEGER  PRIMARY KEY AUTOINCREMENT,
        seed TEXT,
        name TEXT
      );
      CREATE TABLE IF NOT EXISTS user (
        id   INTEGER  PRIMARY KEY AUTOINCREMENT,
        team INTEGER  REFERENCES team,
        logn TEXT     UNIQUE,
        salt BLOB,
        hash BLOB,
        name TEXT,
        role TEXT
      );
      CREATE TABLE IF NOT EXISTS subm (
        id   INTEGER  PRIMARY KEY AUTOINCREMENT,
        team INTEGER  REFERENCES team,
        prob TEXT,  --LOGICALREF prob
        time TEXT,
        out  BLOB,
        code BLOB,
        ok   BOOLEAN,
        vler BLOB,
        vlms REAL
      );
      CREATE TABLE IF NOT EXISTS comp (
        key  TEXT     PRIMARY KEY,
        val  TEXT
      );
    `);
  }

  [Symbol.dispose]() {
    this.#db.close();
  }

  #encStr(input: string) {
    return compressZstd(new TextEncoder().encode(input));
  }

  #decStr(input: Uint8Array) {
    return new TextDecoder().decode(decompressZstd(input));
  }

  getOrSetDefaultMeta<T extends string | undefined>(
    key: string,
    defaultValue?: T,
  ): T extends undefined ? string | null : string {
    const value = this.#db.query<[string]>("SELECT val FROM comp WHERE key = ?", [key])[0]?.[0] ?? null;
    if (value === null && defaultValue !== undefined) {
      this.#db.query("INSERT INTO comp VALUES (?, ?)", [key, defaultValue]);
      return defaultValue;
    }
    return value;
  }

  setMeta(key: string, value: string): string {
    this.#db.query(
      `
        INSERT INTO comp VALUES (:k, :v)
        ON CONFLICT DO UPDATE SET val = :v
      `,
      { k: key, v: value },
    );
    return value;
  }

  allMeta() {
    return Object.fromEntries(this.#db.query<[string, string]>("SELECT * FROM comp"));
  }

  user(id: number): User | undefined {
    return this.#db.queryEntries<User>("SELECT * FROM user WHERE id = ?", [id])[0];
  }

  userTeam(id: number): Team | undefined {
    const user: User | undefined = this.#db.queryEntries<User>("SELECT * FROM user WHERE id = ?", [id])[0];
    if (!user) return undefined;
    const team: Team | undefined = this.#db.queryEntries<Team>("SELECT * FROM team WHERE id = ?", [user.team])[0];
    return team;
  }

  allUsers(): User[] {
    return this.#db.queryEntries<User>("SELECT * FROM user");
  }

  createTeam({ name = null as string | null }): Team {
    const seed = [...crypto.getRandomValues(new Uint8Array(8))].map((v) => v.toString(16).padStart(2, "0")).join("");
    return this.#db.queryEntries<Team>(
      `
        INSERT INTO team VALUES (NULL, :seed, :name)
        RETURNING id
      `,
      { seed, name },
    )[0];
  }

  patchTeam(id: number, { name = null as string | null }): Team | undefined {
    return this.#db.queryEntries<Team>(
      `
        UPDATE team SET name = :name WHERE id = :id
        RETURNING *
      `,
      { id, name },
    )[0];
  }

  deleteTeam(id: number) {
    this.#db.query("DELETE FROM team WHERE id = :id", { id });
  }

  assignUserTeam({ user = null as number | null, team = null as number | null }) {
    this.#db.query("UPDATE user SET team = :team WHERE id = :user", { team, user });
  }

  resetUser(params: { logn: string; role: UserRoles }, resetPassword = true): User {
    return this.#db.queryEntries<User>(
      `
        INSERT INTO user VALUES (NULL, NULL, :logn, :salt, NULL, :logn, :role)
        ON CONFLICT DO UPDATE SET role = :role${resetPassword ? ", hash = NULL" : ""}
        RETURNING *
      `,
      {
        ...params,
        salt: crypto.getRandomValues(new Uint8Array(32)),
      },
    )[0];
  }

  patchUser(id: number, params: Record<string, unknown>): User | undefined {
    return this.#db.queryEntries<User>(
      `
      UPDATE user
      SET (${Object.keys(params).join(", ")}) = (${Object.keys(params).map(v => `:${v}`).join(", ")})
      WHERE id = :id
      RETURNING *
      `,
      { id, ...params },
    )[0];
  }

  deleteUser(id: number) {
    this.#db.query("DELETE FROM user WHERE id = :id", { id });
  }

  async basicAuth({ logn, pass }: { logn: string; pass: Uint8Array }): Promise<User | null> {
    const user = this.#db.queryEntries<User>("SELECT * FROM user WHERE logn = :logn", { logn })[0] ?? null;
    if (user === null) return null;
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array([...pass, ...user.salt])));
    // Password reset mode, overwrite with new password.
    if (user.hash === null) {
      this.#db.query("UPDATE user SET hash = :hash WHERE id = :id", { hash, id: user.id });
      user.hash = hash;
    }
    // normal authentication flow
    else {
      let matches = true;
      // SECURITY: scan full list to avoid any potential side-channel
      for (let i = 0; i < hash.length; ++i) if (hash[i] !== user.hash[i]) matches = false;
      if (!matches) return null;
    }
    return user;
  }

  allTeams(): Team[] {
    return this.#db.queryEntries<Team>("SELECT * FROM team");
  }

  attempts(params: { team: number; prob: string }): number {
    return this.#db.query<[number]>("SELECT COUNT(*) FROM subm WHERE team = :team AND prob = :prob", params)[0][0];
  }

  solved(params: { team: number; prob: string }): boolean {
    return (
      this.#db.query<[number]>(
        "SELECT COUNT(*) FROM subm WHERE ok = TRUE AND team = :team AND prob = :prob",
        params,
      )[0][0] > 0
    );
  }

  solvedSet(params: { team: number }): Set<string> {
    return new Set(
      this.#db.query<[string]>("SELECT DISTINCT prob FROM subm WHERE ok = TRUE AND team = :team", params).flat(),
    );
  }

  score(params: { team: number }): number {
    let total = 0;
    for (const slug of this.solvedSet(params)) {
      total += Object(this.#problems.get(slug)!.doc().front)?.problem?.points ?? 0;
    }
    return total;
  }

  postSubmission({ code, ok, out, prob, team, time, vler, vlms }: Omit<Submission, "id">, resubmit = false): number {
    if (resubmit && ok) {
      this.#db.query<[number]>(
        `
          UPDATE subm SET (out, code, vler, vlms) = (:out, :code, :vler, :vlms)
          WHERE prob = :prob AND team = :team AND ok = TRUE
          RETURNING id
        `,
        { out: this.#encStr(out), code: this.#encStr(code), vler: this.#encStr(vler), vlms, prob, team },
      );
    }
    const id = this.#db.query<[number]>(
      "INSERT INTO subm VALUES (NULL, :team, :prob, :time, :out, :code, :ok, :vler, :vlms) RETURNING id",
      {
        ok, prob, team, time, vlms,
        out: this.#encStr(out),
        code: this.#encStr(code),
        vler: this.#encStr(vler),
      },
    )[0][0];
    this.notify(this);
    return id;
  }

  getSubmissionSkeletons(teamId: number, problemId: string): Omit<Submission, "out" | "code" | "vler" | "vlms">[] {
    return this.#db
      .queryEntries<Submission>("SELECT id, team, prob, time, ok FROM subm WHERE team = ? AND prob = ?", [
        teamId,
        problemId,
      ])
      .map((v) => {
        v.time = new Date(v.time);
        return v;
      });
  }

  getSubmissionOut(id: number): string | undefined {
    const data = this.#db.query<[Uint8Array]>("SELECT out FROM subm WHERE id = :id", { id })[0]?.[0];
    if (!data) return;
    return this.#decStr(data);
  }

  getSubmissionCode(id: number): string | undefined {
    const data = this.#db.query<[Uint8Array]>("SELECT code FROM subm WHERE id = :id", { id })[0]?.[0];
    if (!data) return;
    return this.#decStr(data);
  }

  getSubmissionVler(id: number): string | undefined {
    const data = this.#db.query<[Uint8Array]>("SELECT vler FROM subm WHERE id = :id", { id })[0]?.[0];
    if (!data) return;
    return this.#decStr(data);
  }

  /** @deprecated */
  oldScoreboard(): string {
    let out = "username, points, solved\n";
    for (const { id: team, name } of this.allTeams()) {
      const solved = [...this.solvedSet({ team })].join(", ");
      out += `${name}, ${this.score({ team })}${solved ? ", " + solved : ""}\n`;
    }
    return out;
  }
}
