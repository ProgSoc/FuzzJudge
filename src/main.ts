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

/*

Backend

/comp
- /icon
- /name
- /brief
- /instructions
- /prob
  - /:name
    - /icon : utf-8 (emoji, one extended grapheme)
    - /name
    - /brief
    - /instructions
    - /input
    - /judge
/auth
- /login : Get Bearer Token
- /logout : Expire token

*/

import { undent, indent, loadMarkdown } from "./util.ts";
import { FuzzJudgeProblem } from "./comp.ts";
import { pathJoin, walk, serveFile, normalize, WebSocketServer, WebSocketClient } from "./deps.ts";
import { Auth } from "./auth.ts";
import { appendAnswer, getScoreboard, getAnswered, initialiseUserScore, subscribeToScoreboard, createScoreboardCSV } from "./score.ts";
import { Router } from "./http.ts";
import { HEADER } from "./version.ts";

if (import.meta.main) {

  const root = await Deno.realPath(Deno.args[0] ?? ".");

  const compfile = loadMarkdown(await Deno.readTextFile(pathJoin(root, "./comp.md")));

  const problems: Record<string, FuzzJudgeProblem> = {};
  for await (const ent of walk(root, {
    includeDirs: false,
    includeSymlinks: false,
    match: [/prob\.md/],
    maxDepth: 2,
  })) {
    try {
      const problem = new FuzzJudgeProblem(ent.path, loadMarkdown(await Deno.readTextFile(ent.path)));
      problems[problem.slug()] = problem;
    } catch (e) {
      console.error(`Could not load "${ent.path}": ${e}`);
    }
  }

  const auth = new Auth({
    basic: async ({ username, password }) => {
      // crypto.subtle.digest()
      return { username, id: username };
    },
  });

  const wss = new WebSocketServer(8080);
  subscribeToScoreboard(() => {
    const scoreboard = getScoreboard(problems);
    const csv = createScoreboardCSV(scoreboard);

    for (const client of wss.clients) {
      client.send(csv);
    }
  });

  //
  const router = new Router({
    "GET": _ => HEADER,
    "BREW": _ => new Response("418 I'm a Teapot", { status: 418 }),
    "/auth": {
      "/login": async req => {
        const user = await auth.protect(req);
        initialiseUserScore(user.id);
        return new Response(`Authorized: ${Deno.inspect(user)}\n`);
      },
      "/logout": req => auth.requestAuth(req),
    },
    "/client/*": (req, { 0: path }) => {
      if (!path || path === "") {
        path = "index.html";
      }

      return serveFile(req, pathJoin(root, "client", normalize("/" + path)));
    },
    "/comp": {
      "/name": () => compfile.title ?? "FuzzJudge Competition",
      "/brief": () => compfile.summary ?? "",
      "/instructions": () => new Response(compfile.body, { headers: { "Content-Type": "text/html" } }),
      "/scoreboard": () => {
        const scoreboard = getScoreboard(problems);

        const csv = createScoreboardCSV(scoreboard);

        return new Response(csv, { headers: { "Content-Type": "text/csv" } });
      },
      "/prob": {
        "/:id": {
          "/icon": (_req, { id }) => problems[id!].doc().icon,
          "/name": (_req, { id }) => problems[id!].doc().title,
          "/brief": (_req, { id }) => problems[id!].doc().summary,
          "/difficulty": (_req, { id }) => (problems[id!].doc().config as any)?.problem?.difficulty,
          "/points": (_req, { id }) => (problems[id!].doc().config as any)?.problem?.points,
          "/solution": _ => new Response("451 Unavailable For Legal Reasons", { status: 451 }),
          // Gated (by time and auth) utils ...
          "/instructions": async (req, { id }) => {
            await auth.protect(req);
            return problems[id!].doc().body;
          },
          "/fuzz": async (req, { id }) => {
            const user = await auth.protect(req);
            return await problems[id!].fuzz(user.id);
          },
          "/judge": {
            "GET": async (req, { id: problemId }) => {
              const user = await auth.protect(req);
              return getAnswered(user.id).some(({ slug }) => slug === problemId) ? "OK" : "Not Solved";
            },
            "POST": async (req, { id: problemId }) => {
              const user = await auth.protect(req);
              if (req.headers.get("Content-Type") !== "application/x-www-form-urlencoded") {
                return new Response("415 Unsupported Media Type (Expected application/x-www-form-urlencoded)", { status: 415 });
              }
              const body = await req.text();
              const submissionOutput = new URLSearchParams(body).get("output");
              if (submissionOutput === null) {
                return new Response("400 Bad Request\n\nMissing form field 'output';\nPlease include the output of your solution.\n", { status: 400 });
              }
              const submissionCode = new URLSearchParams(body).get("source");
              if (submissionCode === null) {
                return new Response("400 Bad Request\n\nMissing form field 'source';\nPlease include the source code of your solution for manual review.\n", { status: 400 });
              }
              const { correct, errors } = await problems[problemId!].judge(user.id, submissionOutput);

              if (correct) {
                appendAnswer(user.id, problemId!);
                return "Approved! ✅\n";
              } else {
                return new Response(`422 Unprocessable Content\n\nSolution rejected.\n\n${errors}\n`, { status: 422 });
              }
            },
          },
          "/assets/*": async (req, { id: problemId, 0: assetPath }) => {
            await auth.protect(req);
            return await serveFile(req, pathJoin(root, problemId!, normalize("/" + assetPath)));
          },
        },
      },
      "/team": {},
    },
  });

  Deno.serve({
    port: 1989,
    handler: req => router.route(req),
    onError: (e) => {
      if (e instanceof Response) return e;
      else if (e instanceof Error) return new Response(`Internal Server Error\n\n${e.stack ?? e.message}`, { status: 500 });
      else return new Response(String(e), { status: 500 });
    },
  });
}
