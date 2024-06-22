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

import { FuzzJudgeProblem } from "./comp.ts";
import { DB, compressZstd, decompressZstd } from "./deps.ts"

export type Team = {
  id: number,
  seed: string,
  name: string,
};

export type User = {
  id: number,
  team: number,
  logn: string,
  pass: Uint8Array,
  name: string,
};

export type Submission = {
  id: number,
  team: number,
  prob: string,
  time: Date,
  out: string,
  code: string,
  ok: boolean,
  vler: string,
  vlms: number,
};

export type DBSubscriptionHandler = (db: CompetitionDB) => void | Promise<void>;

export class CompetitionDB {
  #db: DB;
  #problems: Record<string, FuzzJudgeProblem>;
  #subscribers: Set<DBSubscriptionHandler> = new Set();

  constructor(path: string, problems: Record<string, FuzzJudgeProblem>) {
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
        pass BLOB,
        name TEXT
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
    `);
  }

  [Symbol.dispose]() {
    this.#db.close();
  }

  #encStr(input: string) {
    return compressZstd(new TextEncoder().encode(input).buffer);
  }

  #decStr(input: Uint8Array) {
    return new TextDecoder().decode(decompressZstd(input.buffer));
  }

  #notify() {
    for (const fn of this.#subscribers) fn(this);
  }

  subscribe(fn: DBSubscriptionHandler): void {
    this.#subscribers.add(fn);
  }

  unsubscribe(fn: DBSubscriptionHandler): void {
    this.#subscribers.delete(fn);
  }

  user(id: number): User | undefined {
    return this.#db.queryEntries<User>("SELECT * FROM user WHERE id = ?", [id])[0];
  }

  userTeam(id: number): Team {
    return this.#db.queryEntries<Team>("SELECT * FROM team WHERE user = ?", [id])[0];
  }

  auth(params: { logn: string, pass: Uint8Array }): User | null {
    return this.#db.queryEntries<User>("SELECT * FROM user WHERE logn = :logn AND pass = :pass", params)[0] ?? null;
  }

  teams(): Team[] {
    return this.#db.queryEntries<Team>("SELECT * FROM team");
  }

  attempts(params: { team: number, prob: string }): number {
    return this.#db.query<[number]>(
      "SELECT COUNT(*) FROM subm WHERE subm_team = :team AND subm_prob = :prob",
      params,
    )[0][0];
  }

  solved(params: { team: number, prob: string }): boolean {
    return this.#db.query<[number]>(
      "SELECT COUNT(*) FROM subm WHERE subm_ok = TRUE AND subm_team = :team AND subm_prob = :prob",
      params,
    )[0][0] > 0;
  }

  solvedSet(params: { team: number }): Set<string> {
    return new Set(this.#db.query<[string]>(
      "SELECT DISTINCT subm_prob FROM subm WHERE subm_ok = TRUE AND subm_team = :team",
      params,
    ).flat());
  }

  score(params: { team: number }): number {
    let total = 0;
    for (const id of this.solvedSet(params)) {
      total += Object(this.#problems[id].doc().config).problem.points ?? 0;
    }
    return total;
  }

  postSubmission(params: Omit<Submission, "id">): number {
    const id = this.#db.query<[number]>(
      "INSERT INTO subm VALUES (NULL, :team, :prob, :time, :out, :code, :ok, :vler, :vlms) RETURNING id",
      {
        ...params,
        out: this.#encStr(params.out),
        code: this.#encStr(params.code),
        vler: this.#encStr(params.vler),
      },
    )[0][0];
    this.#notify();
    return id;
  }

  /** @deprecated */
  oldScoreboard(): string {
    let out = "username, points, solved\n";
    for (const { id: team, name } of this.teams()) {
      const solved = [...this.solvedSet({ team })].join(", ");
      out += `${name}, ${this.score({ team })}${solved ? ", " + solved : ""}\n`
    }
    return out;
  }
}
