import { writable, type Writable } from "svelte/store";

export const selected_question: Writable<string> = writable("");

export const BACKEND_SERVER: string = "";

export interface QuestionMeta {
  slug: string;
  num: number;
  name: string;
  icon: string;
  instructions: string;
  solved: boolean;
  points: number;
  difficulty: number;
  brief: string;
}

export const question_order = (a: QuestionMeta, b: QuestionMeta): number => {
  if (a.difficulty !== b.difficulty) {
    return a.difficulty - b.difficulty;
  }
  if (a.points !== b.points) {
    return a.points - b.points;
  }

  if (a.slug === b.slug) throw "Duplicate question.";

  for (let i = 0; i < a.slug.length; i++) {
    if (a.slug.charCodeAt(i) !== b.slug.charCodeAt(i)) {
      return a.slug.charCodeAt(i) - b.slug.charCodeAt(i);
    }
  }

  return 1;
};

export const difficulty_name = (d: number) => {
  switch (d) {
    case 0:
      return "Tutorial";
    case 1:
      return "Easy";
    case 2:
      return "Medium";
    case 3:
      return "Hard";
  }
  return "Unknown";
};

export const truncate_username = (username: string) => {
  const MAX_LENGTH = 14;
  return username.length > MAX_LENGTH ? username.slice(0, MAX_LENGTH) + "…" : username;
};

// export let get_questions = async (): Promise<{
//   questions: Record<string, QuestionMeta>;
//   sorted_questions: Record<string, QuestionMeta[]>;
// }> => {
//   let questions = JSON.parse(await (await fetch("questions.json")).text());
//   let sorted_questions = JSON.parse(
//     await (await fetch("sorted_questions.json")).text(),
//   );
//
//   return { questions, sorted_questions };
// };

export interface ScoreboardUser {
  name: string;
  points: number;
  solved: string[];
}

export const parse_scoreboard = (data: string): ScoreboardUser[] => {
  let lines = data.split("\n");
  let users: ScoreboardUser[] = [];

  for (let i = 1; i < lines.length; i++) {
    let cells = lines[i].split(",").map((x) => x.trim());

    if (cells.length < 2) continue;

    let [name, points, ...solved] = cells;
    users.push({ name, points: parseInt(points), solved });
  }

  return users;
};

