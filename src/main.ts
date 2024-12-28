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

import { deleteFalsey, loadMarkdown, SubscriptionGroup, SubscriptionGroupMessage } from "./util.ts";
import { FuzzJudgeProblemMessage, FuzzJudgeProblemSet } from "./comp.ts";
import { accepts, pathJoin, serveFile, normalize, initZstd, Hono } from "./deps.ts";
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
  initZstd();

  const root = await Deno.realPath(Deno.args[0] ?? ".");

  const compfile = loadMarkdown(await Deno.readTextFile(pathJoin(root, "./comp.md")));

  const problems = new FuzzJudgeProblemSet(root);

  const db = new CompetitionDB(pathJoin(root, "comp.db"), problems);
  db.resetUser({ logn: "admin", role: "admin" }, false);

  const clock = new CompetitionClock({
    db,
    plannedStart: new Date(Object(compfile.front)?.times?.start || new Date().toJSON()),
    plannedFinish: new Date(Object(compfile.front)?.times?.finish || new Date(Date.now() + 180 * 60 * 1000).toJSON()), // 3 hrs
  });

  const scoreboard = new CompetitionScoreboard({ db, clock, problems });

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

  // Many components of the API are only available to administrators,
  // and this is used to enforce it in cases where the role of the user is otherwise unused.
  const enforceAdmin = async (req: Request): Promise<void> | never => {
    const { role } = await auth.protect(req);
    if (role !== "admin") {
      auth.reject();
    }
  };

  // Convenience constants for relevant HTTP methods.
  const GET = "GET";
  const POST = "POST";
  const PATCH = "PATCH";
  const DELETE = "DELETE";
  const BREW = "BREW";

  const app = new Hono();

  // Due to the different matching of `/client/` and `/client/:path{.*}`,
  // we cannot use `trimTrailingSlash` since no redirect will happen on `/client`
  // and instead the router will match to the `/client/:path{.*}` pattern.
  // The `appendTrailingSlash` middleware causes a permanent redirect (301),
  // so instead we implement custom middleware that uses a non-permanent redirect (302)
  // that acts in the same way.

  // Currently, the use of non-permanent redirects and with Hono strict mode on
  // is to specifically account for the loading of CSS and JS resources from
  // the Svelte-compiled HTML file. When strict mode is off, and `/client`
  // is requested, `/assets/<resource>` is fetched instead of the correct
  // `/client/assets/<resource>`, but this does not happen if `/client/` is requested instead.
  // If both `/client` and `/client/` can be made to work correctly when fetching
  // such resources under `strict: false`, then we should disable strict mode
  // and no longer use this custom middleware.
  const appendNonPermanentTrailingSlash = () => {
    return async function appendNonPermanentTrailingSlash(c, next) {
      await next();

      if (c.res.status === 404 && c.req.method === GET && !c.req.path.endsWith("/")) {
        const url = new URL(c.req.url);
        url.pathname += "/";

        c.res = c.redirect(url.toString(), 302);
      }
    };
  };

  app.use(appendNonPermanentTrailingSlash());

  // The routing definitions are put together in a single chained statement
  // for the `app` Hono router. For readability,
  // each route has the HTTP method written explicitly as an uppercase constant value
  // followed by the path or list of paths that match the given logic
  // (rather than representing via nested object definitions).

  // No regex bounds are placed on the `:id` route parameter for problem IDs,
  // to give more freedom to folder naming conventions in the question repository.

  app
    .on(GET, "/", (c) => {
      catchWebsocket(c.req.raw, (socket) => {
        socket.addEventListener("open", () => {
          const handler = live.subscribe((msg) => socket.send(JSON.stringify(msg)));
          socket.addEventListener("close", () => live.unsubscribe(handler));
        });
      });
      return c.text(HEADER);
    })
    .on(BREW, "/", (c) => {
      return c.body("418 I'm a Teapot", 418);
    })
    .on(GET, "/auth/", async (c) => {
      const user = await auth.protect(c.req.raw);
      return c.body(user.logn, 200);
    })
    .on(GET, "/void/", (_c) => {
      return auth.reject();
    })
    .on(GET, "/admin/", async (c) => {
      await enforceAdmin(c.req.raw);
      const adminPanel = await Deno.readFile(new URL(import.meta.resolve("./admin.html")));
      return c.body(adminPanel, 200, { "Content-Type": "text/html" });
    })
    .on(GET, "/team/*", async (c) => {
      await enforceAdmin(c.req.raw);
      return c.body(JSON.stringify(db.allTeams()));
    })
    .on(POST, "/team", async (c) => {
      await enforceAdmin(c.req.raw);
      const team = db.createTeam(deleteFalsey(Object.fromEntries(await c.req.raw.formData())) as any);
      return c.body(JSON.stringify(team), 201, {
        "Context-Type": "application/json",
        "Location": `${c.req.raw.url}/${team.id}`,
      });
    }) 
    .on(PATCH, "/team/:id{\\d+}", async (c) => {
      // We assume that the IDs of the teams are stored as integers.
      await enforceAdmin(c.req.raw);
      const id = c.req.param("id");
      db.patchTeam(parseInt(id), deleteFalsey(Object.fromEntries(await c.req.raw.formData())) as any);
      return c.body(null, 204);
    })
    .on(DELETE, "/team/:id{\\d+}", async (c) => {
      await enforceAdmin(c.req.raw);
      const id = c.req.param("id");
      db.deleteTeam(parseInt(id));
      return c.body(null, 204);
    })
    .on(GET, "/user/", async (c) => {
      await enforceAdmin(c.req.raw);
      return c.body(JSON.stringify(db.allUsers()));
    })
    .on(POST, "/user", async (c) => {
      await enforceAdmin(c.req.raw);
      const user = db.resetUser(deleteFalsey(Object.fromEntries(await c.req.raw.formData())) as any);
      return c.body(JSON.stringify(user), 201, {
        "Context-Type": "application/json",
        "Location": `${c.req.raw.url}/${user.id}`,
      });
    })
    .on(PATCH, "/user/:id{\\d+}", async (c) => {
      // We assume that the IDs of the users are stored as integers.
      await enforceAdmin(c.req.raw);
      const id = c.req.param("id");
      db.patchUser(parseInt(id), deleteFalsey(Object.fromEntries(await c.req.raw.formData())) as any);
      return c.body(null, 204);
    })
    .on(DELETE, "/user/:id{\\d+}", async (c) => {
      await enforceAdmin(c.req.raw);
      const id = c.req.param("id");
      db.deleteUser(parseInt(id));
      return c.body(null, 204);
    })
    .on(GET, ["/client/", "/client/:path{.*}"], async (c) => {
      // The use of two patterns here is to make it easier to capture the path of
      // any assets that need to be accessed when loading the client resource.

      // The trailing slash being present is to ensure that
      // the CSS and JS assets being loaded by the compiled Svelte HTML files will find the
      // right directory, since the sources use relative referencing starting with `./assets/`.
      await auth.protect(c.req.raw);
      const path = c.req.param("path") ?? "index.html";
      return serveFile(c.req.raw, pathJoin(root, "client", normalize("/" + path)));
    })
    .on(PATCH, "/mark/", async (c) => {
      await enforceAdmin(c.req.raw);
      const params = new URL(c.req.raw.url).searchParams;
      db.manualJudge(parseInt(params.get("id")!), Boolean(parseInt(params.get("ok")!)));
      return c.body(null, 204);
    })
    .on(GET, "/comp/meta/", async (c) => {
      await enforceAdmin(c.req.raw);
      return c.body(
        JSON.stringify(db.allMeta()),
        200,
        { "Content-Type": "application/json" },
      );
    })
    .on(GET, "/comp/submissions/", async (c) => {
      await enforceAdmin(c.req.raw);
      const params = new URL(c.req.raw.url).searchParams;
      return c.body(
        JSON.stringify(db.getSubmissionSkeletons(parseInt(params.get("team")!), params.get("slug")!)),
        200,
        { "Content-Type": "application/json" },
      );
    })
    .on(GET, "/comp/submission/", async (c) => {
      await enforceAdmin(c.req.raw);
      const params = new URL(c.req.raw.url).searchParams;
      const kind = params.get("kind")!;

      const submId = parseInt(params.get("subm")!);
      const submBody = kind === "out" ? JSON.stringify(db.getSubmissionOut(submId)) :
        kind === "code" ? JSON.stringify(db.getSubmissionCode(submId)) :
        kind === "vler" ? JSON.stringify(db.getSubmissionVler(submId)) :
        "Non-existent submission";

      return c.body(submBody, 200, { "Content-Type": "application/json" });
    })
    .on(GET, "/comp/name/", (c) => {
      return c.body(compfile.title ?? "FuzzJudge Competition");
    })
    .on(GET, "/comp/brief/", (c) => {
      return c.body(compfile.summary ?? "");
    })
    .on(GET, "/comp/instructions/", (c) => {
      return c.body(compfile.body, 200, { "Content-Type": "text/html" });
    })
    .on(GET, "/comp/scoreboard/", (c) => {
      if (c.req.raw.headers.get("Upgrade") === "websocket") {
        // TODO: websocket upgrades and new live scoreboard format
      }
      return c.body(db.oldScoreboard(), 200, { "Content-Type": "text/csv" });
    })
    .on(GET, "/comp/clock/", (c) => {
      catchWebsocket(c.req.raw, (socket) => {
        const handler = clock.subscribe((msg) => socket.send(JSON.stringify(msg)));
        socket.addEventListener("close", () => clock.unsubscribe(handler));
      });
      return c.body(JSON.stringify(clock.now()), 200, { "Content-Type": "application/json" });
    })
    .on(PATCH, "/comp/clock", async (c) => {
      await enforceAdmin(c.req.raw);
      const { kind, time, keep } = deleteFalsey(Object.fromEntries(await c.req.raw.formData()));
      console.log({ kind, time, keep });
      if (kind === "start") {
        clock.adjustStart(new Date(time as string), { keepDuration: !!keep });
      } else {
        clock.adjustFinish(new Date(time as string));
      }
      return c.body(null, 204);
    })
    .on(GET, "/comp/prob/", (c) => {
      return c.body(problems.toJSON().map(v => v.slug + "\n").join(""));
    })
    .on(GET, "/comp/prob/:id/icon/", (c) => {
      const problem = problems.get(c.req.param("id"));
      return problem === undefined ? c.notFound() : c.body(problem.doc().icon);
    })
    .on(GET, "/comp/prob/:id/name/", (c) => {
      const problem = problems.get(c.req.param("id"));
      return problem === undefined ? c.notFound() : c.body(problem.doc().title);
    })
    .on(GET, "/comp/prob/:id/brief/", (c) => {
      const problem = problems.get(c.req.param("id"));
      return problem === undefined ? c.notFound() : c.body(problem.doc().summary);
    })
    .on(GET, "/comp/prob/:id/difficulty/", (c) => {
      const problem = problems.get(c.req.param("id"));
      return problem === undefined ?
        c.notFound() :
        c.body(Object(problem.doc().front)?.problem?.difficulty);
    })
    .on(GET, "/comp/prob/:id/points/", (c) => {
      const problem = problems.get(c.req.param("id"));
      return problem === undefined ?
        c.notFound() :
        c.body(Object(problem.doc().front)?.problem?.points);
    })
    .on(GET, "/comp/prob/:id/solution/", (c) => {
      // What we do not have cannot be stolen: problem solutions are not store explicitly,
      // but rather a verification of the submission is accessible by `/comp/prob/:id/judge`.
      return c.body("Unavailable for Legal Reasons", 451);
    })
    .on(GET, "/comp/prob/:id/instructions/", async (c) => {
      await auth.protect(c.req.raw);
      const problem = problems.get(c.req.param("id"));
      return problem === undefined ?
        c.notFound() :
        c.body(problem.doc().body, 200, { "Content-Type": "text/markdown" });
    })
    .on(GET, "/comp/prob/:id/fuzz/", async (c) => {
      const user = await auth.protect(c.req.raw);
      const problem = problems.get(c.req.param("id"));
      return problem === undefined ?
        c.notFound() :
        c.body(await problem.fuzz(db.userTeam(user.id)!.seed));
    })
    .on(GET, "/comp/prob/:id/judge/", async (c) => {
      const user = await auth.protect(c.req.raw);
      const problemId = c.req.param("id");
      return problems.get(problemId) === undefined ?
        c.notFound() :
        c.body(db.solved({ team: user.team, prob: problemId }) ? "OK" : "Not Solved");
    })
    .on(POST, "/comp/prob/:id/judge", async (c) => {
      const user = await auth.protect(c.req.raw);
      const problemId = c.req.param("id");

      if (problems.get(problemId) === undefined) {
        return c.notFound();
      }

      if (db.solved({ team: user.team, prob: problemId })) {
        return c.body("Problem already solved.\n", 409);
      }
      if (c.req.raw.headers.get("Content-Type") !== "application/x-www-form-urlencoded") {
        return c.body("Unsupported Media Type (Expected application/x-www-form-urlencoded)", 415);
      }

      const body = await c.req.raw.text();
      const submissionOutput = new URLSearchParams(body).get("output");
      if (submissionOutput === null) {
        return c.body("Please include the output of your solution.\n", 400);
      }
      const submissionCode = new URLSearchParams(body).get("source");
      if (submissionCode === null) {
        return c.body("Please include the source code of your solution.\n", 400);
      }

      const time = new Date();
      const t0 = performance.now();
      const { correct, errors } = await problems
        .get(problemId)
        .judge(db.userTeam(user.id)!.seed, submissionOutput);
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
        return c.body("Approved! ✅\n");
      } else {
        return c.body(`Solution rejected.\n\n${errors || ""}`, 422);
      }
    })
    .on(GET, "/comp/prob/:id/assets/:assetPath{.*}", async (c) => {
      await auth.protect(c.req.raw);

      const problemId = c.req.param("id");
      const assetPath = c.req.param("assetPath");

      if (problems.get(problemId) === undefined) {
        return c.notFound();
      }

      const normalisedAssetPath = normalize("/" + assetPath);
      if (problems.get(problemId)!.doc().publicAssets.has(normalisedAssetPath)) {
        return serveFile(c.req.raw, pathJoin(root, problemId, normalisedAssetPath));
      } else {
        return c.notFound();
      }
    });

  await Deno.serve({
    port: 1989,
    handler: app.fetch,
    onError: (e) => {
      if (e instanceof Response) return e;
      else if (e instanceof Error)
        return new Response(`500 Internal Server Error\n\n${e.stack ?? e.message}`, { status: 500 });
      else return new Response(String(e), { status: 500 });
    },
  }).finished;
}
