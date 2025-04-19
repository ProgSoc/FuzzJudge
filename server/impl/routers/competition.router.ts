import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { probRouter } from "./problem.router";
import { authMiddleware, unauthorizedResponse } from "../middleware/auth.middleware";
import { basicAuth } from "../services/auth.service";
import { allMeta } from "../services/meta.service";
import {
  getSubmissionCode,
  getSubmissionOut,
  getSubmissionSkeletons,
  getSubmissionVler,
} from "../services/submission.service";
import { CompetitionClockMessage } from "../clock";
import { clock } from "../app";
import { oldScoreboard } from "../services/scoreboard.service";
import { ee } from "../ee";
import { deleteFalsey } from "../util";
import { getCompetitionData } from "../services/competition.service";
import { upgradeWebSocket } from "../websocket";

const root = Bun.env.COMPETITION_PATH;
if (!root) {
  throw new Error("COMPETITION_PATH env not set");
}

const competionData = await getCompetitionData(root);

export const compRouter = new OpenAPIHono()
  .route("/prob", probRouter)
  .openapi(
    createRoute({
      method: "get",
      path: "/meta",
      responses: {
        200: {
          description: "Meta data",
          content: {
            "application/json": {
              schema: z.record(z.string()),
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
        Bearer: [],
      }]
    }),
    async (c) => {
        const meta = await allMeta()
      return c.json(meta, {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    },
  )
  .get(
    "/submissions",
    authMiddleware({
      verifyUser: basicAuth,
      roles: ["admin"],
    }),
    async (c) => {
      const params = new URL(c.req.url).searchParams;
      return c.json(getSubmissionSkeletons(parseInt(params.get("team")!), params.get("slug")!), {
        headers: { "Content-Type": "application/json" },
      });
    },
  )
  .get(
    "/submission",
    authMiddleware({
      verifyUser: basicAuth,
      roles: ["admin"],
    }),
    async (c) => {
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
    },
  )
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
  .patch(
    "/clock",
    authMiddleware({
      verifyUser: basicAuth,
      roles: ["admin"],
    }),
    async (c) => {
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
    },
  );
