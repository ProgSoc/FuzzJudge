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

import { HEADER } from "../version.ts";
import { deleteFalsey } from "./util.ts";
import { Auth } from "./auth.ts";
import { createClock, type CompetitionClockMessage } from "./clock.ts";
import { createCompetitionScoreboard, type CompetitionScoreboardMessage } from "./score.ts";
import { Hono } from "hono";
import { serveStatic, createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { init as initZstd } from "@bokuweb/zstd-wasm";
import path from "path";
import { ee } from "./ee.ts";
import { migrateDB } from "./db/index.ts";
import { allUsers, deleteUser, patchUser, resetUser } from "./services/user.service.ts";
import { allTeams, createTeam, deleteTeam, getUserTeam, patchTeam } from "./services/team.service.ts";
import {
  getSubmissionCode,
  getSubmissionOut,
  getSubmissionSkeletons,
  getSubmissionVler,
  manualJudge,
  postSubmission,
  solved,
} from "./services/submission.service.ts";
import { basicAuth } from "./services/auth.service.ts";
import { oldScoreboard } from "./services/scoreboard.service.ts";
import { allMeta } from "./services/meta.service.ts";
import { fuzzProblem, getProblems, judgeProblem, problemToMessage, type FuzzJudgeProblemMessage } from "./services/problems.service.ts";
import { getCompetitionData } from "./services/competition.service.ts";

export const { websocket, upgradeWebSocket } = createBunWebSocket<ServerWebSocket>();

await initZstd();
migrateDB();

if (!Bun.env.COMPETITION_PATH) {
  throw new Error("COMPETITION_PATH env not set");
}

const root = path.resolve(Bun.env.COMPETITION_PATH)

const problems = await getProblems(root);
const competionData = await getCompetitionData(root);

resetUser({ logn: "admin", role: "admin" }, false);

export type SocketMessage =
  | { kind: "clock"; value: CompetitionClockMessage }
  | { kind: "problems"; value: FuzzJudgeProblemMessage[] }
  | { kind: "scoreboard"; value: CompetitionScoreboardMessage };

const clock = await createClock(
    competionData.times.start ?? new Date(),
    competionData.times.finish ?? new Date(Date.now() + 180 * 60 * 1000), // 3 hrs
);

const scoreboard = createCompetitionScoreboard(clock, problems);

const auth = new Auth({
  basic: async ({ username, password }) => {
    return await basicAuth({
      logn: username,
      pass: new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))),
    });
  },
});

const teamRouter = new Hono()
  .get("/", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();
    return c.json(allTeams());
  })
  .post("/", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const formData = await c.req.formData();

    const team = await createTeam(deleteFalsey(Object.fromEntries(formData.entries())) as any);
    return c.json(team, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        Location: `${c.req.url}/${team.id}`,
      },
    });
  })
  .patch("/:id", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const formData = await c.req.formData();

    patchTeam(parseInt(c.req.param("id")), deleteFalsey(Object.fromEntries(formData.entries())) as any);
    return c.body(null, { status: 204 });
  })
  .delete("/:id", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    deleteTeam(parseInt(c.req.param("id")));
    return c.body(null, { status: 204 });
  });

const userRouter = new Hono()
  .get("/", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();
    return c.json(allUsers());
  })
  .post("/", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const formData = await c.req.formData();

    const user = await resetUser(deleteFalsey(Object.fromEntries(formData.entries())) as any);
    return c.json(user, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        Location: `${c.req.url}/${user.id}`,
      },
    });
  })
  .patch("/:id", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const formData = await c.req.formData();

    await patchUser(parseInt(c.req.param("id")), deleteFalsey(Object.fromEntries(formData.entries())) as any);
    return c.body(null, { status: 204 });
  })
  .delete("/:id", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    await deleteUser(parseInt(c.req.param("id")));
    return c.body(null, { status: 204 });
  });

const probRouter = new Hono()
  .get("/", (c) => {
    return c.text(
      problems
        .map((v) => v.slug + "\n")
        .join(""),
    );
  })
  .get("/:id/icon", (c) => {
    const id = c.req.param("id");

    const problem = problems.find(({ slug }) => slug === id);

    if (!problem) return c.notFound();

    const { icon } = problem.attributes

    return c.body(icon)
  })
  .get("/:id/name", (c) => {
    const id = c.req.param("id");
    const problem = problems.find(({ slug }) => slug === id);

    if (!problem) return c.notFound();

    const { title}  = problem.attributes
    
    return c.text(title);
  })
  .get("/:id/brief", (c) => {
    const id = c.req.param("id");

    const problem = problems.find(({ slug }) => slug === id);

    if (!problem) return c.notFound();

    const { summary } = problem.attributes

    return c.text(summary ?? "");
  })
  .get("/:id/difficulty", (c) => {
    const id = c.req.param("id");
    const problem = problems.find(({ slug }) => slug === id);

    if (!problem) return c.notFound();

    return c.text(problem.problem.difficulty.toString());
  })
  .get("/:id/points", (c) => {
    const id = c.req.param("id");
    const problem = problems.find(({ slug }) => slug === id);

    if (!problem) return c.notFound();

    return c.text(problem.problem.points.toString());
  })
  .get("/:id/solution", (c) => {
    return c.body("451 Unavailable For Legal Reasons", { status: 451 });
  })
  .get("/:id/instructions", async (c) => {
    // clock.protect();
    await auth.protect(c.req.raw);

    const id = c.req.param("id");
    const problem = problems.find(({ slug }) => slug === id);
    if (!problem) return c.notFound();

    const { body } = problem.attributes;

    return c.body(body, {
      headers: { "Content-Type": "text/markdown" },
    });
  })
  .get("/:id/fuzz", async (c) => {
    // clock.protect();
    const user = await auth.protect(c.req.raw);
    const userTeam = await getUserTeam(user.id);
    const id = c.req.param("id");

    if (!userTeam) {
      return c.body("403 Forbidden\n\nUser not in a team.\n", {
        status: 403,
      });
    }

    const { seed } = userTeam;

    const problem = problems.find(({ slug }) => slug === id);

    if (!problem) return c.notFound();

    const fuzz = await fuzzProblem(root, problem.slug, seed);

    return c.text(fuzz);
  })
  .get("/:id/judge", async (c) => {
    // clock.protect();
    const user = await auth.protect(c.req.raw);

    if (!user.team) {
      return c.body("403 Forbidden\n\nUser not in a team.\n", {
        status: 403,
      });
    }

    return c.text((await solved({ team: user.team, prob: c.req.param("id")! })) ? "OK" : "Not Solved");
  })
  .post("/:id/judge", async (c) => {
    // clock.protect();
    const user = await auth.protect(c.req.raw);
    const id = c.req.param("id");

    if (!user.team) {
      return c.body("403 Forbidden\n\nUser not in a team.\n", {
        status: 403,
      });
    }

    if (await solved({ team: user.team, prob: c.req.param("id")! })) {
      return c.body("409 Conflict\n\nProblem already solved.\n", {
        status: 409,
      });
    }
    const contentType = c.req.header("Content-Type");
    if (contentType !== "application/x-www-form-urlencoded") {
      return c.body("415 Unsupported Media Type (Expected application/x-www-form-urlencoded)", { status: 415 });
    }
    const body = await c.req.text();
    const submissionOutput = new URLSearchParams(body).get("output");
    if (submissionOutput === null) {
      return c.body("400 Bad Request\n\nMissing form field 'output';\nPlease include the output of your solution.\n", {
        status: 400,
      });
    }
    const submissionCode = new URLSearchParams(body).get("source");
    if (submissionCode === null) {
      return c.body(
        "400 Bad Request\n\nMissing form field 'source';\nPlease include the source code of your solution for manual review.\n",
        { status: 400 },
      );
    }
    const time = new Date();

    const userTeam = await getUserTeam(user.id);

    if (!userTeam) {
      return c.body("403 Forbidden\n\nUser not in a team.\n", {
        status: 403,
      });
    }

    const { seed } = userTeam;

    const problem = problems.find(({ slug }) => slug === id);

    if (!problem) return c.notFound();

    const t0 = performance.now();
    const submission = await judgeProblem(root, problem.slug, seed, submissionOutput);
    const t1 = performance.now();

    const { correct } = submission;

    if (correct) {
      await postSubmission({
        team: user.team,
        prob: c.req.param("id")!,
        time: time.toString(),
        out: submissionOutput,
        code: submissionCode,
        ok: submission.correct,
        vler: "",
        vlms: t1 - t0,
      });

      return c.text("Approved! ✅\n");
    }

    const { errors } = submission;

    await postSubmission({
      team: user.team,
      prob: c.req.param("id")!,
      time: time.toString(),
      out: submissionOutput,
      code: submissionCode,
      ok: correct,
      vler: errors,
      vlms: t1 - t0,
    });

    return c.body(`422 Unprocessable Content\n\nSolution rejected.\n\n${errors}\n`, { status: 422 });
  })
  .get("/:id/assets/*", async (c, next) => {
    await auth.protect(c.req.raw);
    // clock.protect();
    const probId = c.req.param("id");

    return serveStatic({
      root: path.join(root, "problems", probId, "assets"),
    })(c, next);
  });

const compRouter = new Hono()
  .route("/prob", probRouter)
  .get("/meta", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();
    return c.json(allMeta(), {
      headers: { "Content-Type": "application/json" },
    });
  })
  .get("/submissions", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const params = new URL(c.req.url).searchParams;
    return c.json(getSubmissionSkeletons(parseInt(params.get("team")!), params.get("slug")!), {
      headers: { "Content-Type": "application/json" },
    });
  })
  .get("/submission", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const params = new URL(c.req.url).searchParams;
    switch (params.get("kind")) {
      case "out": {
        return c.json(getSubmissionOut(parseInt(params.get("subm")!)), {
          headers: { "Content-Type": "application/json" },
        });
      }
      case "code": {
        return c.json(getSubmissionCode(parseInt(params.get("subm")!)), {
          headers: { "Content-Type": "application/json" },
        });
      }
      case "vler": {
        return c.json(getSubmissionVler(parseInt(params.get("subm")!)), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  })
  .get("/name", (c) => {
    return c.text(competionData.attributes.title ?? "FuzzJudge Competition");
  })
  .get("/brief", (c) => {
    return c.text(competionData.attributes.summary ?? "");
  })
  .get("/instructions", (c) => {
    return c.body(competionData.attributes.body, {
      headers: { "Content-Type": "text/html" },
    });
  })
  .get("/scoreboard", async (c) => {
    // clock.protect([CompState.BEFORE, CompState.LIVE_WITH_SCORES]);
    return c.body(await oldScoreboard(root), {
      headers: { "Content-Type": "text/csv" },
    });
  })
  .get(
    "/clock",
    upgradeWebSocket((c) => {
      let handler: (data: CompetitionClockMessage) => void;
      return {
        onOpen: (_, ws) => {
          handler = (msg) => {
            ws.send(JSON.stringify(msg));
          };
          ee.on("clock", handler);
          // send initial data
          ws.send(JSON.stringify(clock.now()));
          console.log("WebSocket clock connection opened");
        },
        onClose: () => {
          ee.off("clock", handler);
        },
      };
    }),
  )
  .patch("/clock", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const { kind, time, keep } = deleteFalsey(Object.fromEntries((await c.req.formData()).entries()));
    console.log({ kind, time, keep });
    if (kind === "start") {
      await clock.adjustStart(new Date(time as string), {
        keepDuration: !!keep,
      });
    } else {
      await clock.adjustFinish(new Date(time as string));
    }
    return c.body(null, { status: 204 });
  });

const basePath = Bun.env["BASE_PATH"] ?? "/";
const app = new Hono()
  .basePath(basePath as "/")
  .route("/comp", compRouter)
  .route("/user", userRouter)
  .route("/team", teamRouter)
  .get("/", async (c) => {
    return c.text(HEADER);
  })
  .get(
    "/ws",
    upgradeWebSocket(() => {
      let clockHandler: (data: CompetitionClockMessage) => void;
      let scoreboardHandler: (data: CompetitionScoreboardMessage) => void;

      return {
        onOpen: async (e, ws) => {
          clockHandler = (msg) => {
            ws.send(JSON.stringify({ kind: "clock", value: msg }));
          };
          scoreboardHandler = (msg) => {
            ws.send(JSON.stringify({ kind: "scoreboard", value: msg }));
          };

          ee.on("clock", clockHandler);
          ee.on("scoreboard", scoreboardHandler);

          setTimeout(async () => {
            ws.send(JSON.stringify({ kind: "problems", value: problems.map(problemToMessage) }));
            ws.send(JSON.stringify({ kind: "clock", value: clock.now() }));
            ws.send(
              JSON.stringify({
                kind: "scoreboard",
                value: await scoreboard.fullScoreboard(),
              }),
            );
          }, 1000);

          console.log("WebSocket connection opened");
        },
        onClose: () => {
          ee.off("clock", clockHandler);
          ee.off("scoreboard", scoreboardHandler);
        },
      };
    }),
  )
  .on("BREW", ["/"], (c) => {
    return c.text("418 I'm a Teapot", 418);
  })
  .get("/auth", async (c) => {
    const user = await auth.protect(c.req.raw);
    return c.text(user.logn);
  })
  .get("/admin", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const fileContent = await Bun.file(new URL(import.meta.resolve("./impl/admin.html"))).text();

    return c.body(fileContent, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  })
  .patch("/mark", async (c) => {
    const { role } = await auth.protect(c.req.raw);
    if (role !== "admin") auth.reject();

    const params = new URL(c.req.url).searchParams;
    await manualJudge(parseInt(params.get("id")!), Boolean(parseInt(params.get("ok")!)));
    return c.body(null, { status: 204 });
  })
  
  .get("/void", () => {
    return auth.reject();
  })
  .get(
    "/client/*",
    serveStatic({
      root: path.join(root, "client"),
    }),
  );

export default app;

export type AppType = typeof app;
