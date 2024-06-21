import { BACKEND_SERVER, parse_scoreboard, question_order, type QuestionMeta, type ScoreboardUser} from "./utils";

export let get_questions = async (): Promise<Record<string, QuestionMeta>> => {
  let questions: Record<string, QuestionMeta> = {};

  try {
    const res = await (await fetch(`${BACKEND_SERVER}/comp/prob`)).text();
    let arr = res.split("\n").filter(x => x !== "");

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
}

export interface ScoreboardEvent {
  new_scoreboard: ScoreboardUser[];
}

export const subscribe_to_scoreboard = async (callback: (data: ScoreboardEvent) => void): Promise<(() => void)> => {
  const server = window.location.hostname;
  const port = 8080;

  const socket = new WebSocket(`ws://${server}:${port}`)

  socket.addEventListener("message", (event) => {
    callback({ new_scoreboard: parse_scoreboard(event.data) });
  });

  return () => {
    socket.close();
  };
};

export const get_comp_info = async (): Promise<{ title: string, instructions: string }> => {
  const title = await (await fetch(`${BACKEND_SERVER}/comp/name`)).text();
  const instructions = await (await fetch(`${BACKEND_SERVER}/comp/instructions`)).text();
  return { title, instructions };
};

export const get_scoreboard = async (): Promise<ScoreboardUser[]> => {
  return parse_scoreboard(await (await fetch(`${BACKEND_SERVER}/comp/scoreboard`)).text());
};

export const get_username = async (): Promise<string> => {
  const res = await (await fetch(`${BACKEND_SERVER}/auth/login`)).text();
  const username = res.match(/username: \"(.*)\"/g)?.[0]?.split('"')[1] ?? "Unknown";
  return username;
};

const get_question_data = async (slug: string) => {
  const data: QuestionMeta = {
    slug,
    num: -1,
    name: await (
      await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/name`)
    ).text(),
    icon: await (
      await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/icon`)
    ).text(),
    instructions: await (
      await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/instructions`)
    ).text(),
    solved:
      (await (
        await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/judge`)
      ).text()) === "OK",
    points: parseInt(
      await (await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/points`)).text(),
    ),
    difficulty: parseInt(
      await (
        await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/difficulty`)
      ).text(),
    ),
    brief: await (
      await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/brief`)
    ).text(),
  };

  data.instructions = data.instructions.replace(
    /(<img\s+[^>]*src=")(?!https:\/\/)([^"]+)"/g,
    (match, p1, p2) => {
      return `${p1}${BACKEND_SERVER}/comp/prob/${slug}/assets/${p2}"`;
    },
  );

  return data;
};

