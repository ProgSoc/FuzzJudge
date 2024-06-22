/*
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { writable, type Writable } from "svelte/store";

export const selected_question: Writable<string> = writable("");

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

export interface CompTimes {
  start: Date;
  freeze: Date;
  stop: Date;
}

export const parse_times = (data: string): CompTimes => {
  let obj = JSON.parse(data);
  obj.start = new Date(obj.start);
  obj.freeze = new Date(obj.freeze);
  obj.stop = new Date(obj.stop);
  return obj;
};

export enum CompState {
  BEFORE,
  LIVE_WITH_SCORES,
  LIVE_WITHOUT_SCORES,
  FINISHED,
}

export const get_current_comp_state = (times: CompTimes) => {
  const now = new Date(Date.now());
  if (now < times.start) {
    return CompState.BEFORE;
  } else if (now < times.freeze) {
    return CompState.LIVE_WITH_SCORES;
  } else if (now < times.stop) {
    return CompState.LIVE_WITHOUT_SCORES;
  } else {
    return CompState.FINISHED;
  }
};

export const get_state_start_time = (times: CompTimes, state: CompState): Date => {
  switch (state) {
    case CompState.LIVE_WITH_SCORES:
    case CompState.BEFORE: // theres not really a start time for before so it is just the start time of live
      return times.start;
    case CompState.LIVE_WITHOUT_SCORES:
      return times.freeze;
    case CompState.FINISHED:
      return times.stop;
  }
};

// Returns the number of milliseconds until the next state
export const get_time_till_next_state = (times: CompTimes | undefined, current: CompState | undefined): number => {
  if (current === CompState.FINISHED || times == undefined || current == undefined) {
    return 1e10;
  }

  return get_state_start_time(times, current + 1).getTime() - new Date().getTime();
};

export const showing_questions_at_current_time = (times: CompTimes): boolean => {
  const state = get_current_comp_state(times);
  return state === CompState.LIVE_WITH_SCORES || state === CompState.LIVE_WITHOUT_SCORES;
};
