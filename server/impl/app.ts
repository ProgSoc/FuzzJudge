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
import { loadMarkdown } from "./markdown.ts";
import { createFuzzJudgeProblemSet, type FuzzJudgeProblemMessage, type FuzzJudgeProblemSetMessage } from "./comp.ts";
import { Auth } from "./auth.ts";
import { createClock, type CompetitionClockMessage } from "./clock.ts";
import {
    createCompetitionScoreboard,
   type CompetitionScoreboardMessage,
} from "./score.ts";
import { Hono } from "hono";
import { serveStatic, createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { init as initZstd } from "@bokuweb/zstd-wasm";
import path from "path"
import { parseArgs } from "util";
import { fileURLToPath } from "bun";
import { ee } from "./ee.ts";
import { createCompetitionDB } from "./db/index.ts";

export const { websocket, upgradeWebSocket } = createBunWebSocket<ServerWebSocket>();

await initZstd();

const { positionals} = parseArgs({
    args: Bun.argv,
    allowPositionals: true,
})

const pathPositional = positionals[2];

const root = path.join(path.dirname( fileURLToPath(import.meta.url)),  pathPositional ?? ".")

const compfile = loadMarkdown(
    await Bun.file(path.join(root, "./comp.md")).text(),
);

const problems = createFuzzJudgeProblemSet(root);

const db = createCompetitionDB(path.join(root, "comp.db"), problems);

db.resetUser({ logn: "admin", role: "admin" }, false);

export type SocketMessage = { kind: "clock", value: CompetitionClockMessage } | { kind: "problems", value: FuzzJudgeProblemMessage[] } | { kind: "scoreboard", value: CompetitionScoreboardMessage };

const clock = await createClock(
    db,
    new Date(
        Object(compfile.front)?.times?.start || new Date().toJSON(),
    ),
   new Date(
        Object(compfile.front)?.times?.finish ||
            new Date(Date.now() + 180 * 60 * 1000).toJSON(),
    ), // 3 hrs
);

const scoreboard = createCompetitionScoreboard(db, clock, problems);

const auth = new Auth({
    basic: async ({ username, password }) => {
        return await db.basicAuth({
            logn: username,
            pass: new Uint8Array(
                await crypto.subtle.digest(
                    "SHA-256",
                    new TextEncoder().encode(password),
                ),
            ),
        });
    },
});

const teamRouter = new Hono()
    .get("/", async (c) => {
        const { role } = await auth.protect(c.req.raw);
        if (role !== "admin") auth.reject();
        return c.json(db.allTeams());
    })
    .post("/", async (c) => {
        const { role } = await auth.protect(c.req.raw);
        if (role !== "admin") auth.reject();

        const formData = await c.req.formData();

        const team = await db.createTeam(
            deleteFalsey(Object.fromEntries(formData.entries())) as any,
        );
        return c.json(team, {
            status: 201,
            headers: {
                "Content-Type": "application/json",
                "Location": `${c.req.url}/${team.id}`,
            },
        });
    })
    .patch("/:id", async (c) => {
        const { role } = await auth.protect(c.req.raw);
        if (role !== "admin") auth.reject();

        const formData = await c.req.formData();

        db.patchTeam(
            parseInt(c.req.param("id")),
            deleteFalsey(Object.fromEntries(formData.entries())) as any,
        );
        return c.body(null, { status: 204 });
    })
    .delete("/:id", async (c) => {
        const { role } = await auth.protect(c.req.raw);
        if (role !== "admin") auth.reject();

        db.deleteTeam(parseInt(c.req.param("id")));
        return c.body(null, { status: 204 });
    });

const userRouter = new Hono()
    .get("/", async (c) => {
        const { role } = await auth.protect(c.req.raw);
        if (role !== "admin") auth.reject();
        return c.json(db.allUsers());
    })
    .post("/", async (c) => {
        const { role } = await auth.protect(c.req.raw);
        if (role !== "admin") auth.reject();

        const formData = await c.req.formData();

        const user = await db.resetUser(
            deleteFalsey(Object.fromEntries(formData.entries())) as any,
        );
        return c.json(user, {
            status: 201,
            headers: {
                "Content-Type": "application/json",
                "Location": `${c.req.url}/${user.id}`,
            },
        });
    })
    .patch("/:id", async (c) => {
        const { role } = await auth.protect(c.req.raw);
        if (role !== "admin") auth.reject();

        const formData = await c.req.formData();

        db.patchUser(
            parseInt(c.req.param("id")),
            deleteFalsey(Object.fromEntries(formData.entries())) as any,
        );
        return c.body(null, { status: 204 });
    })
    .delete("/:id", async (c) => {
        const { role } = await auth.protect(c.req.raw);
        if (role !== "admin") auth.reject();

        db.deleteUser(parseInt(c.req.param("id")));
        return c.body(null, { status: 204 });
    });

const probRouter = new Hono()
    .get("/", (c) => {
        return c.text(problems.toJSON().map((v) => v.slug + "\n").join(""));
    })
    .get("/:id/icon", (c) => {
        const icn = problems.get(c.req.param("id"))!.doc.icon;

        if (!icn) return c.notFound();

        return c.body(icn);
    })
    .get("/:id/name", (c) => {
        const name = problems.get(c.req.param("id"))!.doc.title;

        if (!name) return c.notFound();

        return c.text(name);
    })
    .get("/:id/brief", (c) => {
        const brief = problems.get(c.req.param("id"))!.doc.summary;

        if (!brief) return c.notFound();

        return c.text(brief);
    })
    .get("/:id/difficulty", (c) => {
        const difficulty = Object(problems.get(c.req.param("id"))!.doc.front)
            ?.problem?.difficulty;

        if (!difficulty) return c.notFound();

        return c.text(difficulty);
    })
    .get("/:id/points", (c) => {
        const points = Object(problems.get(c.req.param("id"))!.doc.front)
            ?.problem?.points;

        if (!points) return c.notFound();

        return c.text(points);
    })
    .get("/:id/solution", (c) => {
        return c.body("451 Unavailable For Legal Reasons", { status: 451 });
    })
    .get("/:id/instructions", async (c) => {
        // clock.protect();
        await auth.protect(c.req.raw);

        const problem = problems.get(c.req.param("id"))!.doc.body;

        return c.body(problem, {
            headers: { "Content-Type": "text/markdown" },
        });
    })
    .get("/:id/fuzz", async (c) => {
        // clock.protect();
        const user = await auth.protect(c.req.raw);
        const userTeam = await db.userTeam(user.id);

        if (!userTeam) {
            return c.body("403 Forbidden\n\nUser not in a team.\n", {
                status: 403,
            });
        }

        const problem = await problems.get(c.req.param("id"))!.fuzz(
             userTeam.seed,
        );

        return c.text(problem);
    })
    .get("/:id/judge", async (c) => {
        // clock.protect();
        const user = await auth.protect(c.req.raw);

        if (!user.team) {
            return c.body("403 Forbidden\n\nUser not in a team.\n", {
                status: 403,
            });
        }

        return c.text(
            await db.solved({ team: user.team, prob: c.req.param("id")! })
                ? "OK"
                : "Not Solved",
        );
    })
    .post("/:id/judge", async (c) => {
        // clock.protect();
        const user = await auth.protect(c.req.raw);

        if (!user.team) {
            return c.body("403 Forbidden\n\nUser not in a team.\n", {
                status: 403,
            });
        }

        if (await db.solved({ team: user.team, prob: c.req.param("id")! })) {
            return c.body("409 Conflict\n\nProblem already solved.\n", {
                status: 409,
            });
        }
        const contentType = c.req.header("Content-Type");
        if (contentType !== "application/x-www-form-urlencoded") {
            return c.body(
                "415 Unsupported Media Type (Expected application/x-www-form-urlencoded)",
                { status: 415 },
            );
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

        const userTeam = await db.userTeam(user.id);

        if (!userTeam) {
            return c.body("403 Forbidden\n\nUser not in a team.\n", {
                status: 403,
            });
        }

        const { correct, errors } = await problems
            .get(c.req.param("id"))!
            .judge(userTeam.seed, submissionOutput);
        const t1 = performance.now();

        db.postSubmission({
            team: user.team,
            prob: c.req.param("id")!,
            time: time.toString(),
            out: submissionOutput,
            code: submissionCode,
            ok: correct,
            vler: errors || "",
            vlms: t1 - t0,
        });

        if (correct) {
            return c.text("Approved! ✅\n");
        } else {
            return c.body(
                `422 Unprocessable Content\n\nSolution rejected.\n\n${errors}\n`,
                { status: 422 },
            );
        }
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
        return c.json(db.allMeta(), {
            headers: { "Content-Type": "application/json" },
        });
    })
    .get("/submissions", async (c) => {
        const { role } = await auth.protect(c.req.raw);
        if (role !== "admin") auth.reject();

        const params = new URL(c.req.url).searchParams;
        return c.json(
            db.getSubmissionSkeletons(
                parseInt(params.get("team")!),
                params.get("slug")!,
            ),
            { headers: { "Content-Type": "application/json" } },
        );
    })
    .get("/submission", async (c) => {
        const { role } = await auth.protect(c.req.raw);
        if (role !== "admin") auth.reject();

        const params = new URL(c.req.url).searchParams;
        switch (params.get("kind")) {
            case "out": {
                return c.json(
                    db.getSubmissionOut(parseInt(params.get("subm")!)),
                    { headers: { "Content-Type": "application/json" } },
                );
            }
            case "code": {
                return c.json(
                    db.getSubmissionCode(parseInt(params.get("subm")!)),
                    { headers: { "Content-Type": "application/json" } },
                );
            }
            case "vler": {
                return c.json(
                    db.getSubmissionVler(parseInt(params.get("subm")!)),
                    { headers: { "Content-Type": "application/json" } },
                );
            }
        }
    })
    .get("/name", (c) => {
        return c.text(compfile.title ?? "FuzzJudge Competition");
    })
    .get("/brief", (c) => {
        return c.text(compfile.summary ?? "");
    })
    .get("/instructions", (c) => {
        return c.body(compfile.body, {
            headers: { "Content-Type": "text/html" },
        });
    })
    .get("/scoreboard", async (c) => {
        // clock.protect([CompState.BEFORE, CompState.LIVE_WITH_SCORES]);
        return c.body(await db.oldScoreboard(), {
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
                    ee.on("clock",handler);
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

        const { kind, time, keep } = deleteFalsey(
            Object.fromEntries((await c.req.formData()).entries()),
        );
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
const app = new Hono().basePath(basePath as "/")
    .get("/", async (c) => {
        return c.text(HEADER);
    })
    .get("/ws", upgradeWebSocket(() => {
        let problemHander: (data: FuzzJudgeProblemSetMessage) => void;
        let clockHandler: (data: CompetitionClockMessage) => void;
        let scoreboardHandler: (data: CompetitionScoreboardMessage) => void;

        return {
            onOpen: async (e, ws) => {
                problemHander = (msg: FuzzJudgeProblemSetMessage) => {
                    ws.send(JSON.stringify({ kind: "problems", value: msg }));
                };
                clockHandler = (msg) => {
                    ws.send(JSON.stringify({ kind: "clock", value: msg }));
                };
                scoreboardHandler = (msg) => {
                    ws.send(
                        JSON.stringify({ kind: "scoreboard", value: msg }),
                    );
                };

                ee.on("problems", problemHander);
                ee.on("clock", clockHandler);
                ee.on("scoreboard", scoreboardHandler);
                
                // send initial data
                ws.send(JSON.stringify({ kind: "problems", value: problems.toJSON() }));
                ws.send(JSON.stringify({ kind: "clock", value: clock.now() }));
                ws.send(
                    JSON.stringify({
                        kind: "scoreboard",
                        value: await scoreboard.fullScoreboard()
                    }),
                );


                console.log("WebSocket connection opened");
            },
            onClose: () => {
                ee.off("problems", problemHander);
                ee.off("clock", clockHandler);
                ee.off("scoreboard", scoreboardHandler);
            },
        };
    }))
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

        const fileContent = await Bun.file(
            new URL(import.meta.resolve("./impl/admin.html")),
        ).text()

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
        db.manualJudge(
            parseInt(params.get("id")!),
            Boolean(parseInt(params.get("ok")!)),
        );
        return c.body(null, { status: 204 });
    })
    .route("/comp", compRouter)
    .route("/user", userRouter)
    .route("/team", teamRouter)
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
