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
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
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
import { Scalar } from "@scalar/hono-api-reference";
import { basicAuth } from "./services/auth.service.ts";
import { oldScoreboard } from "./services/scoreboard.service.ts";
import { allMeta } from "./services/meta.service.ts";
import {
  fuzzProblem,
  getProblems,
  judgeProblem,
  problemToMessage,
  type FuzzJudgeProblemMessage,
} from "./services/problems.service.ts";
import { getCompetitionData } from "./services/competition.service.ts";
import { teamRouter } from "./routers/team.router.ts";
import { userRouter } from "./routers/user.router.ts";
import { probRouter } from "./routers/problem.router.ts";
import { compRouter } from "./routers/competition.router.ts";
import { authMiddleware, forbiddenResponse, unauthorizedResponse } from "./middleware/auth.middleware.ts";
import { upgradeWebSocket } from "./websocket.ts";
import { swaggerUI } from "@hono/swagger-ui";
import { z } from "@hono/zod-openapi";

await initZstd();
migrateDB();

if (!Bun.env.COMPETITION_PATH) {
  throw new Error("COMPETITION_PATH env not set");
}

const root = path.resolve(Bun.env.COMPETITION_PATH);

const problems = await getProblems(root);
const competionData = await getCompetitionData(root);

resetUser({ logn: "admin", role: "admin" }, false);

export type SocketMessage =
  | { kind: "clock"; value: CompetitionClockMessage }
  | { kind: "problems"; value: FuzzJudgeProblemMessage[] }
  | { kind: "scoreboard"; value: CompetitionScoreboardMessage };

export const clock = await createClock(
  competionData.times.start ?? new Date(),
  competionData.times.finish ?? new Date(Date.now() + 180 * 60 * 1000), // 3 hrs
);

export const scoreboard = createCompetitionScoreboard(clock, problems);

const basePath = Bun.env["BASE_PATH"] ?? "/";
const app = new OpenAPIHono()
  .basePath(basePath as "/")
  .route("/comp", compRouter)
  .route("/user", userRouter)
  .route("/team", teamRouter)
  .openapi(
    createRoute({
      path: "/scalar",
      hide: true,
      method: "get",
      responses: {
        200: {
          description: "OpenAPI JSON",
        },
      },
      middleware: Scalar({
        url: "/docs.json",
      }),
    }),
    (c) => c.text("dummy response"),
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/swagger",
      hide: true,
      responses: {
        200: {
          description: "Swagger UI",
          content: {
            "text/html": {
              schema: z.string(),
            },
          },
        },
      },
      middleware: swaggerUI({
        url: "/docs.json",
        title: "FuzzJudge API",
        
      }),
    }),
    async (c) => {
      return c.text("dummy response");
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      responses: {
        200: {
          description: "FuzzJudge API",
          content: {
            "text/plain": {
              schema: z.string(),
            },
          },
        },
      },
    }),
    async (c) => {
      return c.text(HEADER);
    },
  )
  .openapi(
    createRoute({
      path: "/ws",
      method: "get",
      responses: {
        101: {
          description: "WebSocket connection",
        },
      },
      middleware: upgradeWebSocket(() => {
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
    }),
    async (c) => {
      return c.text("dummy response");
    },
  )
  .openapi(
    createRoute({
      method: "brew" as "get", // Nobody likes brew
      path: "/",
      responses: {
        418: {
          description: "I'm a teapot",
        },
      },
    }),
    async (c) => {
      return c.text("I'm a teapot", 418);
    },
  )
  .openapi(
    createRoute({
      path: "/auth",
      method: "get",
      responses: {
        200: {
          description: "Auth",
          content: {
            "text/plain": {
              schema: z.string(),
            }
          },
        },
        401: unauthorizedResponse,
      },
      middleware: authMiddleware({
        verifyUser: basicAuth,
      }),
      security: [{
        "Basic": []
      }],
    }),
    async (c) => {
      const { logn } = c.var.user;
      return c.text(logn);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/admin",
      responses: {
        200: {
          description: "Admin",
          content: {
            "text/html": {
              schema: z.string(),
            },
          },
        },
        401: unauthorizedResponse,
      },
      middleware: authMiddleware({
        verifyUser: basicAuth,
        roles: ["admin"],
      }),
      security: [{
        "Basic": []
      }],
    }),
    async (c) => {
      const fileContent = await Bun.file(new URL(import.meta.resolve("./impl/admin.html"))).text();

      return c.body(fileContent, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/mark",
      middleware: authMiddleware({
        verifyUser: basicAuth,
        roles: ["admin"],
      }),
      security: [{
        "Basic": []
      }],
      responses: {
        204: {
          description: "OK",
        }
      },
      request: {
        query: z.object({
          id: z.coerce.number().openapi({
            param: {
              name: "id",
              in: "query",
              required: true,
            }
          }),
          ok: z.coerce.boolean().openapi({
            param: {
              name: "ok",
              in: "query",
              required: true,
            }
          }),
        }),
      }}),
    async (c) => {
      const { ok, id } = c.req.valid("query")

      await manualJudge(id, ok);
      return c.body(null, { status: 204 });
    },
  )

  .openapi(
    createRoute({
      method: "get",
      path: "/void",
      middleware: authMiddleware({
        verifyUser: basicAuth,
        roles: [null],
      }),
      security: [{
        "Basic": []
      }],
      responses: {
        204: {
          description: "OK",
        },
        401: unauthorizedResponse,
        403: forbiddenResponse,
      }
    }),
    async (c) => {
      return c.body(null, { status: 204 });
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/client/*",
      hide: true,
      responses: {
        200: {
          description: "Client",
        },
      },
      middleware: serveStatic({
        root: path.join(root, "client"),
      }),
    }),
    async (c) => {
      return c.text("dummy response");
    },
  );

app.openAPIRegistry.registerComponent("securitySchemes", "Basic", {
  type: "http",
  scheme: "basic",
});

app.doc("/docs.json", {
  info: {
    title: "FuzzJudge API",
    description: "FuzzJudge API",
    version: "0.1.0",
  },
  openapi: "3.0.0",
  // security: [{
  //   "Basic": []
  // }],
})

export default app;

export type AppType = typeof app;
