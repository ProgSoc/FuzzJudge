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

export function calculatePoints(problems: Record<string, FuzzJudgeProblem>, answers: Answer[]) {
  return answers.reduce((acc, answer) => problems[answer.slug]?.doc().config?.problem?.points ?? 0 + acc, 0);
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

  if (answered.find((a) => a.slug === slug) !== undefined) return;

  answered.push({ slug, time: new Date(Date.now()) });

  db.query("REPLACE INTO scores (username, answered) VALUES (?, ?)", [username, JSON.stringify(answered)]);
}
