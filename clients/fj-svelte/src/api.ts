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

import type { SocketMessage } from "../../../src/live/socketData.ts";
import { parse_scoreboard, question_order, type CompTimes, type QuestionMeta, type ScoreboardUser } from "./utils";

export const BACKEND_SERVER: string = "";

export let get_questions = async (): Promise<Record<string, QuestionMeta>> => {
  let questions: Record<string, QuestionMeta> = {};

  try {
    const res = await fetch(`${BACKEND_SERVER}/comp/prob`);

    if (!res.ok) {
      throw "Failed to fetch questions";
    }

    const text = await res.text();
    let arr = text.split("\n").filter((x) => x !== "");

    if (arr.length === 0) {
      throw "No questions found";
    }

    for (const slug of arr) {
      questions[slug] = await get_question_data(slug);
    }

    const sorted = Object.values(questions).sort(question_order);

    for (let i = 0; i < sorted.length; i++) {
      sorted[i].num = i + 1;
    }
  } catch (e: any) {
    throw e.toString();
  }

  return questions;
};

export interface ScoreboardEvent {
  new_scoreboard: ScoreboardUser[];
}

export const subscribe_to_scoreboard = async (callback: (data: ScoreboardEvent) => void): Promise<() => void> => {
  const server = window.location.hostname;
  const port = 8080;

  const socket = new WebSocket(`ws://${server}:${port}`);

  socket.addEventListener("message", (event) => {
    callback({ new_scoreboard: parse_scoreboard(event.data) });
  });

  return () => {
    socket.close();
  };
};

export const get_comp_info = async (): Promise<{ title: string; instructions: string }> => {
  const title = await (await fetch(`${BACKEND_SERVER}/comp/name`)).text();
  const instructions = await (await fetch(`${BACKEND_SERVER}/comp/instructions`)).text();
  return { title, instructions };
};

export const get_scoreboard = async (): Promise<ScoreboardUser[]> => {
  return parse_scoreboard(await (await fetch(`${BACKEND_SERVER}/comp/scoreboard`)).text());
};

export const get_username = async (): Promise<string> => {
  return await fetch(`${BACKEND_SERVER}/auth`).then((r) => r.text());
};

const get_question_data = async (slug: string) => {
  const data: QuestionMeta = {
    slug,
    num: -1,
    name: await (await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/name`)).text(),
    icon: await (await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/icon`)).text(),
    instructions: await (await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/instructions`)).text(),
    solved: (await (await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/judge`)).text()) === "OK",
    points: parseInt(await (await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/points`)).text()),
    difficulty: parseInt(await (await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/difficulty`)).text()),
    brief: await (await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/brief`)).text(),
  };

  data.instructions = data.instructions.replace(/(<img\s+[^>]*src=")(?!https:\/\/)([^"]+)"/g, (match, p1, p2) => {
    return `${p1}${BACKEND_SERVER}/comp/prob/${slug}/assets/${p2}"`;
  });

  return data;
};

export const submit_solution = async (
  slug: string,
  output: string,
  source: string,
): Promise<{ correct: boolean; message: string }> => {
  const res = await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/judge`, {
    method: "POST",
    body: new URLSearchParams({
      output,
      source,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return {
    correct: res.ok,
    message: await res.text(),
  };
};

export const open_fuzz = (slug: string) => {
  window.open(`${BACKEND_SERVER}/comp/prob/${slug}/fuzz`, "_blank");
};
