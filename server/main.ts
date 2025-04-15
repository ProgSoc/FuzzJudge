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

import { pathJoin, serveFile, normalize, initZstd } from "./deps.ts";
import { HEADER } from "./version.ts";
import { deleteFalsey } from "./impl/util.ts";
import { loadMarkdown } from "./impl/markdown.ts";
import { SubscriptionGroup, SubscriptionGroupMessage, SubscriptionHandler } from "./impl/subscribable.ts";
import { FuzzJudgeProblemMessage, FuzzJudgeProblemSet } from "./impl/comp.ts";
import { Auth } from "./impl/auth.ts";
import { CompetitionDB } from "./impl/db.ts";
import { CompetitionClock, CompetitionClockMessage } from "./impl/clock.ts";
import { CompetitionScoreboard, CompetitionScoreboardMessage } from "./impl/score.ts";
import { Hono } from "jsr:@hono/hono";
import { upgradeWebSocket, serveStatic } from 'jsr:@hono/hono/deno'

// Temporary
export type SocketMessage = SubscriptionGroupMessage<{
  clock: CompetitionClockMessage;
  scoreboard: CompetitionScoreboardMessage;
  problems: FuzzJudgeProblemMessage[];
}>;


if (import.meta.main) {
  const basePath = Deno.env.get("BASE_PATH") ?? "/";
  const app = new Hono().basePath(basePath);

  console.log("Base path:", basePath);

  await initZstd();

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

  app.get("/", async (c, next) => {
    // if not websocket return header
    if (c.req.header("Upgrade") !== "websocket") {
      return c.text(HEADER);
    }

    const upgr = await upgradeWebSocket(() => {
      let handler: SubscriptionHandler<SocketMessage>;
      return {
        onOpen: (_, ws) => {
          handler = live.subscribe((msg) => ws.send(JSON.stringify(msg)));
        },
        onClose: () => {
          live.unsubscribe(handler);
        },
      }
    })(c, next)

    if (upgr) {
      return upgr;
    }

    return c.text(HEADER);
  })

  app.on("BREW", ["/"], (c) => {
    return c.text("418 I'm a Teapot", 418);
  })

  app.get("/auth", async (c) => {
    const user = await auth.protect(c.req.raw);
    return c.text(user.logn);
  })

  app.get("/admin", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const fileContent = await Deno.readFile(new URL(import.meta.resolve("./impl/admin.html")))

    return c.body(fileContent, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  })

  app.patch("/mark", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const params = new URL(c.req.url).searchParams;
    db.manualJudge(parseInt(params.get("id")!), Boolean(parseInt(params.get("ok")!)));
    return c.body(null, { status: 204 });
  })

  const teamRouter = new Hono()

  teamRouter.get("/", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();
    return c.json(db.allTeams());
  })

  teamRouter.post("/", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const formData = await c.req.formData()

    const team = db.createTeam(deleteFalsey(Object.fromEntries(formData)) as any);
    return c.json(team, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Location": `${c.req.url}/${team.id}`,
      },
    })
  })

  teamRouter.patch("/:id", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const formData = await c.req.formData()

    db.patchTeam(parseInt(c.req.param("id")), deleteFalsey(Object.fromEntries(formData)) as any);
    return c.body(null, { status: 204 });
  })

  teamRouter.delete("/:id", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    db.deleteTeam(parseInt(c.req.param("id")));
    return c.body(null, { status: 204 });
  })

  const userRouter = new Hono()

  userRouter.get("/", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();
    return c.json(db.allUsers());
  })

  userRouter.post("/", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const formData = await c.req.formData()

    const user = db.resetUser(deleteFalsey(Object.fromEntries(formData)) as any);
    return c.json(user, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Location": `${c.req.url}/${user.id}`,
      },
    })
  })

  userRouter.patch("/:id", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const formData = await c.req.formData()

    db.patchUser(parseInt(c.req.param("id")), deleteFalsey(Object.fromEntries(formData)) as any);
    return c.body(null, { status: 204 });
  })

  userRouter.delete("/:id", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    db.deleteUser(parseInt(c.req.param("id")));
    return c.body(null, { status: 204 });
  })

  const compRouter = new Hono()

  compRouter.get("/meta", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();
    return c.json(db.allMeta(), { headers: { "Content-Type": "application/json" } });
  })

  compRouter.get("/submissions", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const params = new URL(c.req.url).searchParams;
    return c.json(db.getSubmissionSkeletons(parseInt(params.get("team")!), params.get("slug")!), { headers: { "Content-Type": "application/json" } });
  })

  compRouter.get("/submission", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const params = new URL(c.req.url).searchParams;
    switch (params.get("kind")) {
      case "out": {
        return c.json(db.getSubmissionOut(parseInt(params.get("subm")!)), { headers: { "Content-Type": "application/json" } });
      }
      case "code": {
        return c.json(db.getSubmissionCode(parseInt(params.get("subm")!)), { headers: { "Content-Type": "application/json" } });
      }
      case "vler": {
        return c.json(db.getSubmissionVler(parseInt(params.get("subm")!)), { headers: { "Content-Type": "application/json" } });
      }
    }
  })

  compRouter.get("/name", (c) => {
    return c.text(compfile.title ?? "FuzzJudge Competition");
  })

  compRouter.get("/brief", (c) => {
    return c.text(compfile.summary ?? "");
  })

  compRouter.get("/instructions", (c) => {
    return c.body(compfile.body, { headers: { "Content-Type": "text/html" } });
  })

  compRouter.get("/scoreboard", (c) => {
    // clock.protect([CompState.BEFORE, CompState.LIVE_WITH_SCORES]);
    return c.body(db.oldScoreboard(), { headers: { "Content-Type": "text/csv" } });
  })

  compRouter.get("/clock", upgradeWebSocket(() => {
    let handler: SubscriptionHandler<CompetitionClockMessage>;
    return {
      onOpen: (_, ws) => {
        handler = clock.subscribe((msg) => ws.send(JSON.stringify(msg)));
      },
      onClose: () => {
        clock.unsubscribe(handler);
      },
    }
  }))

  compRouter.patch("/clock", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const { kind, time, keep } = deleteFalsey(Object.fromEntries(await c.req.formData()));
    console.log({ kind, time, keep });
    if (kind === "start") {
      clock.adjustStart(new Date(time as string), { keepDuration: !!keep });
    } else {
      clock.adjustFinish(new Date(time as string));
    }
    return c.body(null, { status: 204 });
  })

  const probRouter = new Hono()

  probRouter.get("/", (c) => {
    return c.text(problems.toJSON().map(v => v.slug + "\n").join(""));
  })

  probRouter.get("/:id/icon", (c) => {
    const icn = problems.get(c.req.param("id"))!.doc().icon

    if (!icn) return c.notFound()

    return c.body(icn)
  })

  probRouter.get("/:id/name", (c) => {
    const name = problems.get(c.req.param("id"))!.doc().title;

    if (!name) return c.notFound()

    return c.text(name);
  })

  probRouter.get("/:id/brief", (c) => {
    const brief = problems.get(c.req.param("id"))!.doc().summary;

    if (!brief) return c.notFound()

    return c.text(brief);
  })

  probRouter.get("/:id/difficulty", (c) => {
    const difficulty = Object(problems.get(c.req.param("id"))!.doc().front)?.problem?.difficulty;

    if (!difficulty) return c.notFound()

    return c.text(difficulty);
  })

  probRouter.get("/:id/points", (c) => {
    const points = Object(problems.get(c.req.param("id"))!.doc().front)?.problem?.points;

    if (!points) return c.notFound()

    return c.text(points);
  })

  probRouter.get("/:id/solution", (c) => {
    return c.body("451 Unavailable For Legal Reasons", { status: 451 });
  })

  probRouter.get("/:id/instructions", async (c) => {
    // clock.protect();
    await auth.protect(c.req.raw);

    const problem = problems.get(c.req.param("id"))!.doc().body

    return c.body(problem, { headers: { "Content-Type": "text/markdown" } });
  })

  probRouter.get("/:id/fuzz", async (c) => {
    // clock.protect();
    const user = await auth.protect(c.req.raw);
    const problem = await problems.get(c.req.param("id"))!.fuzz(db.userTeam(user.id)!.seed);

    return c.text(problem);
  })

  probRouter.get("/:id/judge", async (c) => {
    // clock.protect();
    const user = await auth.protect(c.req.raw);
    return c.text(db.solved({ team: user.team, prob: c.req.param("id")! }) ? "OK" : "Not Solved");
  })

  probRouter.post("/:id/judge", async (c) => {
    // clock.protect();
    const user = await auth.protect(c.req.raw);
    if (db.solved({ team: user.team, prob: c.req.param("id")! })) {
      return c.body("409 Conflict\n\nProblem already solved.\n", { status: 409 });
    }
    const contentType = c.req.header("Content-Type");
    if (contentType !== "application/x-www-form-urlencoded") {
      return c.body("415 Unsupported Media Type (Expected application/x-www-form-urlencoded)", { status: 415 });
    }
    const body = await c.req.text();
    const submissionOutput = new URLSearchParams(body).get("output");
    if (submissionOutput === null) {
      return c.body(
        "400 Bad Request\n\nMissing form field 'output';\nPlease include the output of your solution.\n",
        { status: 400 },
      );
    }
    const submissionCode = new URLSearchParams(body).get("source");
    if (submissionCode === null) {
      return c.body(
        "400 Bad Request\n\nMissing form field 'source';\nPlease include the source code of your solution for manual review.\n",
        { status: 400 },
      );
    }
    const time = new Date();
    const t0 = performance.now();
    const { correct, errors } = await problems
      .get(c.req.param("id"))!
      .judge(db.userTeam(user.id)!.seed, submissionOutput);
    const t1 = performance.now();

    db.postSubmission({
      team: user.team,
      prob: c.req.param("id")!,
      time,
      out: submissionOutput,
      code: submissionCode,
      ok: correct,
      vler: errors || "",
      vlms: t1 - t0,
    });

    if (correct) {
      return c.text("Approved! ✅\n");
    } else {
      return c.body(`422 Unprocessable Content\n\nSolution rejected.\n\n${errors}\n`, { status: 422 });
    }
  })

  probRouter.get("/:id/assets/*", async (c, next) => {
    await auth.protect(c.req.raw);
    // clock.protect();
    const probId = c.req.param("id");

    return serveStatic({
      root: pathJoin(root, "problems", probId, "assets"),
    })(c, next);
  })

  compRouter.route("/prob", probRouter)

  app.route("/comp", compRouter)

  app.route("/user", userRouter)

  app.route("/team", teamRouter)

  app.get("/void", () => {
    return auth.reject();
  })

  app.get("/client/*", serveStatic({
    root: pathJoin(root, "client"),
  }))

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
