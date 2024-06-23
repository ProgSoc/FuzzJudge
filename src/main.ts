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

import { loadMarkdown, SubscriptionGroup, SubscriptionGroupMessage } from "./util.ts";
import { FuzzJudgeProblemMessage, FuzzJudgeProblemSet } from "./comp.ts";
import { accepts, pathJoin, serveFile, normalize } from "./deps.ts";
import { Auth } from "./auth.ts";
import { Router, catchWebsocket, expectForm, expectMime } from "./http.ts";
import { HEADER } from "./version.ts";
import { CompetitionDB, UserRoles } from "./db.ts";
import { CompetitionClock, CompetitionClockMessage } from "./clock.ts";
import { CompetitionScoreboard, CompetitionScoreboardMessage } from "./score.ts";

// Temporary
export type SocketMessage = SubscriptionGroupMessage<{
  clock: CompetitionClockMessage;
  scoreboard: CompetitionScoreboardMessage;
  problems: FuzzJudgeProblemMessage[];
}>;

if (import.meta.main) {
  const root = await Deno.realPath(Deno.args[0] ?? ".");

  const compfile = loadMarkdown(await Deno.readTextFile(pathJoin(root, "./comp.md")));

  const problems = new FuzzJudgeProblemSet(root);

  const db = new CompetitionDB(pathJoin(root, "comp.db"), problems);
  db.resetUser({ logn: "admin", role: "admin" }, false);

  const clock = new CompetitionClock({
    db,
    plannedStart: new Date(Object(compfile.front)?.times?.start || new Date().toJSON()),
    plannedFinish: new Date(Object(compfile.front)?.times?.start || new Date(Date.now() + 180 * 60 * 1000).toJSON()), // 3 hrs
  });

  const scoreboard = new CompetitionScoreboard({ db, clock, problems });

  clock.adjustStart(new Date(), { keepDuration: true });

  const live = new SubscriptionGroup({
    clock,
    scoreboard,
    problems,
  });

  const auth = new Auth({
    basic: async ({ username, password }) => {
      return await db.basicAuth({
        logn: username,
        pass: new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))),
      });
    },
  });

  const router = new Router({
    GET: (req) => {
      catchWebsocket(req, (socket) => {
        socket.addEventListener("open", () => {
          const handler = live.subscribe((msg) => socket.send(JSON.stringify(msg)));
          socket.addEventListener("close", () => live.unsubscribe(handler));
        });
      });
      return HEADER;
    },
    BREW: (_) => new Response("418 I'm a Teapot", { status: 418 }),
    "/auth": async (req) => {
      const user = await auth.protect(req);
      return new Response(user.logn);
    },
    "/void": (_req) => {
      return auth.reject();
    },
    "/admin": {
      GET: async (req) => {
        const { role } = await auth.protect(req);
        if (role !== "admin") auth.reject();
        // console.log([...Deno.readDirSync(import.meta.resolve("/"))]);
        return new Response(
          await Deno.readFile(new URL(import.meta.resolve("./admin.html"))),
          { headers: { "Content-Type": "text/html" } },
        );
      },
    },
    "/team": {
      GET: async (req) => {
        const { role } = await auth.protect(req);
        if (role !== "admin") auth.reject();
        return new Response(JSON.stringify(db.allTeams()));
      },
    },
    "/user": {
      GET: async (req) => {
        const { role } = await auth.protect(req);
        if (role !== "admin") auth.reject();
        return new Response(JSON.stringify(db.allUsers()));
      },
      PUT: async (req) => {
        const { role } = await auth.protect(req);
        if (role !== "admin") auth.reject();
        const { role: newUserRole, logn: newUserLogn } = await expectForm(req, { logn: null, role: null });
        if (!["admin", "competitor"].includes(newUserRole))
          throw new Response("400 Bad Request\n\nExpected 'role' to be one of 'admin', or 'competitor'.\n", {
            status: 400,
          });
        db.resetUser({ logn: newUserLogn, role: newUserRole as UserRoles });
        return new Response("201 Created\n", { status: 201 });
      },
      PATCH: async (req) => {
        const requester = await auth.protect(req);
        expectMime(req, "application/x-www-form-urlencoded");
        const form = new URLSearchParams(await req.text());
        const targetLogn = new URL(req.url).searchParams.get("logn");
        if (targetLogn === null) return new Response("400 Bad Request\n\nInvalid search logn.\n", { status: 400 });
        const toUpdate: Record<string, string | number> = {};
        let passedChecks = false;
        if (requester.role === "admin" || targetLogn === requester.logn) {
          const name = form.get("name") || null;
          if (name) toUpdate["name"] = name;
          passedChecks = true;
        }
        if (requester.role === "admin") {
          const logn = form.get("logn") || null;
          const role = form.get("role") || null;
          if (logn) toUpdate["logn"] = logn;
          if (role) toUpdate["role"] = role;
          passedChecks = true;
        }
        if (!passedChecks) auth.reject();
        try {
          if (Object.keys(toUpdate).length === 0) {
            return new Response("400 Bad Request\n\nNothing specified to update.\n", { status: 400 });
          }
          db.updateUser(targetLogn, toUpdate);
          return new Response(null, { status: 204 });
        } catch {
          return new Response("409 Conflict\n\nLogin already exists.\n", { status: 409 });
        }
      },
      DELETE: async (req) => {
        const { role } = await auth.protect(req);
        if (role !== "admin") auth.reject();
        expectMime(req, "application/x-www-form-urlencoded");
        const targetLogn = new URL(req.url).searchParams.get("logn");
        if (targetLogn === null) return new Response("400 Bad Request\n\nInvalid search logn.\n", { status: 400 });
        db.deleteUser({ logn: targetLogn });
        return new Response(null, { status: 204 });
      },
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
      "/scoreboard": (req) => {
        // clock.protect([CompState.BEFORE, CompState.LIVE_WITH_SCORES]);
        if (req.headers.get("Upgrade") == "websocket") {
          // TODO: websocket upgrades and new live scoreboard format
        }
        return new Response(db.oldScoreboard(), { headers: { "Content-Type": "text/csv" } });
      },
      "/clock": {
        GET: (req) => {
          catchWebsocket(req, (socket) => {
            const handler = clock.subscribe((msg) => socket.send(JSON.stringify(msg)));
            socket.addEventListener("close", () => clock.unsubscribe(handler));
          });
          return new Response(JSON.stringify(clock.now()), { headers: { "Content-Type": "text/json" } });
        },
      },
      "/prob": {
        GET: () => Object.keys(problems).join("\n"),
        "/:id": {
          "/icon": (_req, { id }) => problems.get(id!)!.doc().icon,
          "/name": (_req, { id }) => problems.get(id!)!.doc().title,
          "/brief": (_req, { id }) => problems.get(id!)!.doc().summary,
          "/difficulty": (_req, { id }) => Object(problems.get(id!)!.doc().front)?.problem?.difficulty,
          "/points": (_req, { id }) => Object(problems.get(id!)!.doc().front)?.problem?.points,
          "/solution": (_) => new Response("451 Unavailable For Legal Reasons", { status: 451 }),
          // Gated (by time and auth) utils ...
          "/instructions": async (req, { id }) => {
            // clock.protect();
            await auth.protect(req);
            return new Response(problems.get(id!)!.doc().body, { headers: { "Content-Type": "text/markdown" } });
          },
          "/fuzz": async (req, { id }) => {
            // clock.protect();
            const user = await auth.protect(req);
            return await problems.get(id!)!.fuzz(db.userTeam(user.team).seed);
          },
          "/judge": {
            GET: async (req, { id: problemId }) => {
              // clock.protect();
              const user = await auth.protect(req);
              return db.solved({ team: user.team, prob: problemId! }) ? "OK" : "Not Solved";
            },
            POST: async (req, { id: problemId }) => {
              // clock.protect();
              const user = await auth.protect(req);
              if (db.solved({ team: user.team, prob: problemId! })) {
                return new Response("409 Conflict\n\nProblem already solved.\n");
              }
              if (req.headers.get("Content-Type") !== "application/x-www-form-urlencoded") {
                return new Response("415 Unsupported Media Type (Expected application/x-www-form-urlencoded)", {
                  status: 415,
                });
              }
              const body = await req.text();
              const submissionOutput = new URLSearchParams(body).get("output");
              if (submissionOutput === null) {
                return new Response(
                  "400 Bad Request\n\nMissing form field 'output';\nPlease include the output of your solution.\n",
                  { status: 400 },
                );
              }
              const submissionCode = new URLSearchParams(body).get("source");
              if (submissionCode === null) {
                return new Response(
                  "400 Bad Request\n\nMissing form field 'source';\nPlease include the source code of your solution for manual review.\n",
                  { status: 400 },
                );
              }
              const time = new Date();
              const t0 = performance.now();
              const { correct, errors } = await problems
                .get(problemId!)!
                .judge(db.userTeam(user.team).seed, submissionOutput);
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
            const normalisedAssetPath = normalize("/" + assetPath);
            if (problems.get(problemId!)!.doc().publicAssets.has(normalisedAssetPath)) {
              return await serveFile(req, pathJoin(root, problemId!, normalize("/" + assetPath)));
            } else {
              return undefined;
            }
          },
        },
      },
    },
  });

  await Deno.serve({
    port: 1989,
    handler: (req) => router.route(req),
    onError: (e) => {
      if (e instanceof Response) return e;
      else if (e instanceof Error)
        return new Response(`500 Internal Server Error\n\n${e.stack ?? e.message}`, { status: 500 });
      else return new Response(String(e), { status: 500 });
    },
  }).finished;
}
