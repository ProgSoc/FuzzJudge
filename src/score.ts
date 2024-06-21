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
import { DB } from "./deps.ts"

const db = new DB("scores.db");

db.execute(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    answered TEXT
  )
`);

export type Answer = {
  slug: string,
  time: Date,
}

export function getAnswered(username: string): Answer[] {
  return JSON.parse(db.query("SELECT answered FROM scores WHERE username == ?", [username])[0] ?? "[]");
}

export type UserScore = {
  username: string,
  answers: Answer[],
  points: number,
}

const subscriptions: (() => void)[] = [];

export function subscribeToScoreboard(fn: () => void) {
  subscriptions.push(fn);
}

export function notifySubscribers() {
  for (const fn of subscriptions) {
    fn();
  }
}

export function calculatePoints(problems: Record<string, FuzzJudgeProblem>, answers: Answer[]) {
  return answers.reduce((acc, answer) => (problems[answer.slug]?.doc().config?.problem?.points ?? 0) + acc, 0);
}

export function getScoreboard(problems: Record<string, FuzzJudgeProblem>): UserScore[] {
  return db.query("SELECT * FROM scores").map(([id, username, answersJSON]) => {
    const answers = JSON.parse(answersJSON ?? "[]");
    return {
      username: username,
      answers: answers,
      points: calculatePoints(problems, answers),
    };
  })
}

export function appendAnswer(username: string, slug: string) {
  let answered = getAnswered(username);
  if (answered.some((a) => a.slug === slug)) return;
  answered.push({ slug, time: new Date(Date.now()) });
  db.query("REPLACE INTO scores (username, answered) VALUES (?, ?)", [username, JSON.stringify(answered)]);
  notifySubscribers();
}

export function initialiseUserScore(username: string) {
  if (db.query("SELECT * FROM scores WHERE username == ?", [username]).length > 0) return;
  db.query("INSERT INTO scores (username, answered) VALUES (?, ?)", [username, "[]"]);
  notifySubscribers();
}

export function createScoreboardCSV(scoreboard: UserScore[]): string {
  let csv = "username, points, solved\n";
  for (const user of scoreboard) {
    csv += `${user.username}, ${user.points}`;
    if (user.answers.length > 0) {
      csv += `, ${user.answers.map(({ slug }) => slug).join(", ")}`;
    }
    csv += "\n";
  }
  return csv;
}
