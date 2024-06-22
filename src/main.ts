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

import { loadMarkdown } from "./util.ts";
import { FuzzJudgeProblem } from "./comp.ts";
import { pathJoin, walk, serveFile, normalize } from "./deps.ts";
import { Auth } from "./auth.ts";
import { Router } from "./http.ts";
import { HEADER } from "./version.ts";
import { CompetitionDB } from "./db.ts";
import { DBSubscriptionHandler } from "./db.ts";
import { Clock } from "./clock.ts";

if (import.meta.main) {

  const root = await Deno.realPath(Deno.args[0] ?? ".");

  const compfile = loadMarkdown(await Deno.readTextFile(pathJoin(root, "./comp.md")));
  const clock = new Clock(compfile.title ?? "progcomp1");

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

  const db = new CompetitionDB(pathJoin(root, "comp.db"), problems);

  const auth = new Auth({
    basic: async ({ username, password }) => {
      return db.auth({
        logn: username,
        pass: new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))),
      });
    },
  });

  // Migrate into scoreboard endpoint
  Deno.serve({ port: 8080 }, req => {
    if (req.headers.get("Upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    const handler: DBSubscriptionHandler = db => socket.send(db.oldScoreboard());

    socket.addEventListener("open", () => db.subscribe(handler));
    socket.addEventListener("close", () => db.unsubscribe(handler));

    return response;
  });

  //
  const router = new Router({
    "GET": _ => HEADER,
    "BREW": _ => new Response("418 I'm a Teapot", { status: 418 }),
    "/auth": {
      "/login": async req => {
        console.log("authing")
        const user = await auth.protect(req);
        return new Response(`Authorized: ${Deno.inspect(user)}\n`);
      },
      "/logout": req => auth.requestAuth(req),
    },
    "/client/*": (req, { 0: path }) => {
      if (!path || path === "") {
        path = "index.html";
      } else if (path.endsWith("/")) {
        path += "index.html";
      }
      return serveFile(req, pathJoin(root, "client", normalize("/" + path)));
    },
    "/comp": {
      "/name": () => compfile.title ?? "FuzzJudge Competition",
      "/brief": () => compfile.summary ?? "",
      "/instructions": () => new Response(compfile.body, { headers: { "Content-Type": "text/html" } }),
      "/scoreboard": req => {
        // clock.protect([CompState.BEFORE, CompState.LIVE_WITH_SCORES]);
        if (req.headers.get("Upgrade") == "websocket") {
          // TODO: websocket upgrades and new live scoreboard format
        }
        return new Response(db.oldScoreboard(), { headers: { "Content-Type": "text/csv" } });
      },
      "/clock": {
        "GET": () => new Response(clock.times_json(), { headers: { "Content-Type": "text/json" }}),
        "POST": async (req) => {
          const user = await auth.protect(req);
          // if user is not admin return 401
          const body = await req.text()
          clock.set_times(body);
          return new Response("Success");
        }
      },
      "/prob": {
        "GET": () => Object.keys(problems).join("\n"),
        "/:id": {
          "/icon": (_req, { id }) => problems[id!].doc().icon,
          "/name": (_req, { id }) => problems[id!].doc().title,
          "/brief": (_req, { id }) => problems[id!].doc().summary,
          "/difficulty": (_req, { id }) => (problems[id!].doc().config as any)?.problem?.difficulty,
          "/points": (_req, { id }) => (problems[id!].doc().config as any)?.problem?.points,
          "/solution": _ => new Response("451 Unavailable For Legal Reasons", { status: 451 }),
          // Gated (by time and auth) utils ...
          "/instructions": async (req, { id }) => {
            // clock.protect();
            await auth.protect(req);
            return problems[id!].doc().body;
          },
          "/fuzz": async (req, { id }) => {
            // clock.protect();
            const user = await auth.protect(req);
            return await problems[id!].fuzz(db.userTeam(user.team).seed);
          },
          "/judge": {
            "GET": async (req, { id: problemId }) => {
              // clock.protect();
              const user = await auth.protect(req);
              return db.solved({ team: user.team, prob: problemId! }) ? "OK" : "Not Solved";
            },
            "POST": async (req, { id: problemId }) => {
              // clock.protect();
              const user = await auth.protect(req);
              if (db.solved({ team: user.team, prob: problemId! })) {
                return new Response("409 Conflict\n\nProblem already solved.\n");
              }
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
              const time = new Date();
              const t0 = performance.now();
              const { correct, errors } = await problems[problemId!].judge(db.userTeam(user.team).seed, submissionOutput);
              const t1 = performance.now();

              db.postSubmission({
                team: user.team,
                prob: problemId!,
                time,
                out: submissionOutput,
                code: submissionCode,
                ok: correct,
                vler: errors || "",
                vlms: t1 - t0,
              });

              if (correct) {
                return "Approved! ✅\n";
              } else {
                return new Response(`422 Unprocessable Content\n\nSolution rejected.\n\n${errors}\n`, { status: 422 });
              }
            },
          },
          "/assets/*": async (req, { id: problemId, 0: assetPath }) => {
            await auth.protect(req);
            // clock.protect();
            return await serveFile(req, pathJoin(root, problemId!, normalize("/" + assetPath)));
          },
        },
      },
      "/team": {},
    },
  });

  await Deno.serve({
    port: 1989,
    handler: req => router.route(req),
    onError: (e) => {
      if (e instanceof Response) return e;
      else if (e instanceof Error) return new Response(`Internal Server Error\n\n${e.stack ?? e.message}`, { status: 500 });
      else return new Response(String(e), { status: 500 });
    },
  }).finished;
}
