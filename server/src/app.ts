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

import path from "node:path";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { createSchema, createYoga } from "graphql-yoga";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { competitionRoot } from "./config.ts";
import { migrateDB } from "./db/index.ts";
import { ee } from "./ee.ts";
import {
	authMiddleware,
	forbiddenResponse,
	unauthorizedResponse,
} from "./middleware/auth.middleware.ts";
import { makeWebsocketGraphQLMiddleware } from "./middleware/graphqlWs.middleware.ts";
import { resolvers } from "./schema/resolvers.generated";
import { typeDefs } from "./schema/typeDefs.generated";
import { basicAuth } from "./services/auth.service.ts";
import { getCompetitionData } from "./services/competition.service.ts";
import {
	type FuzzJudgeProblemMessage,
	getProblems,
	problemToMessage,
} from "./services/problems.service.ts";
import { manualJudge } from "./services/submission.service.ts";
import { resetUser } from "./services/user.service.ts";
import { type CompetitionClockMessage, createClock } from "./v1/clock.ts";
import { compRouter } from "./v1/routers/competition.router.ts";
import { teamRouter } from "./v1/routers/team.router.ts";
import { userRouter } from "./v1/routers/user.router.ts";
import {
	type CompetitionScoreboardMessage,
	createCompetitionScoreboard,
} from "./v1/score.ts";
import { HEADER } from "./version.ts";
import { upgradeWebSocket } from "./websocket.ts";

migrateDB();

const root = competitionRoot;

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

const schema = createSchema({ typeDefs, resolvers });

const graphqlWsMiddleware = makeWebsocketGraphQLMiddleware({
	upgradeWebSocket,
	schema,
	context: ({ extra: { c } }) => ({
		c,
	}),
});

const yoga = createYoga({
	schema,
	graphiql: {
		subscriptionsProtocol: "WS",
	},
});

let openWebSockets = 0;

const basePath = Bun.env.BASE_PATH ?? "/";
const app = new OpenAPIHono().basePath(basePath as "/");
app.route("/comp", compRouter);
app.route("/user", userRouter);
app.route("/team", teamRouter);
app.openapi(
	createRoute({
		path: "/docs/scalar",
		hide: true,
		method: "get",
		responses: {
			200: {
				description: "OpenAPI JSON",
			},
		},
		middleware: Scalar({
			url: "/docs/json",
		}),
		operationId: "getOpenAPI",
	}),
	(c) => c.text("dummy response"),
);
app.openapi(
	createRoute({
		method: "get",
		path: "/docs/swagger",
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
			url: "/docs/json",
			title: "FuzzJudge API",
		}),
		operationId: "getSwaggerUI",
	}),
	async (c) => {
		return c.text("dummy response");
	},
);
app.openapi(
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
		operationId: "getHeader",
	}),
	async (c) => {
		return c.text(HEADER);
	},
);
app.openapi(
	createRoute({
		path: "/ws",
		method: "get",
		responses: {
			101: {
				description: "WebSocket connection",
			},
		},
		// middleware: ,
		operationId: "getWebSocket",
	}),
	async (c, next) => {
		const websocketUpgrade = await upgradeWebSocket(() => {
			let clockHandler: (data: CompetitionClockMessage) => void;
			let scoreboardHandler: (data: CompetitionScoreboardMessage) => void;

			return {
				onOpen: async (e, ws) => {
					openWebSockets++;

					clockHandler = (msg) => {
						ws.send(JSON.stringify({ kind: "clock", value: msg }));
					};
					scoreboardHandler = (msg) => {
						ws.send(JSON.stringify({ kind: "scoreboard", value: msg }));
					};

					ee.on("clock", clockHandler);
					ee.on("scoreboard", scoreboardHandler);

					setTimeout(async () => {
						ws.send(
							JSON.stringify({
								kind: "problems",
								value: problems.map(problemToMessage),
							}),
						);
						ws.send(JSON.stringify({ kind: "clock", value: clock.now() }));
						ws.send(
							JSON.stringify({
								kind: "scoreboard",
								value: await scoreboard.fullScoreboard(),
							}),
						);
					}, 1000);

					console.log(`🔗 (${openWebSockets}) Connection Opened`);
				},
				onClose: () => {
					openWebSockets--;
					ee.off("clock", clockHandler);
					ee.off("scoreboard", scoreboardHandler);

					console.log(`⛓️‍💥 (${openWebSockets}) Connection Closed`);
				},
			};
		})(c, next);

		if (websocketUpgrade) {
			return websocketUpgrade;
		}

		return c.text("dummy response");
	},
);
app.openapi(
	createRoute({
		method: "brew" as "get", // Nobody likes brew
		path: "/",
		responses: {
			418: {
				description: "I'm a teapot",
			},
		},
		operationId: "brewTeapot",
	}),
	async (c) => {
		return c.text("I'm a teapot", 418);
	},
);
app.openapi(
	createRoute({
		path: "/auth",
		method: "get",
		responses: {
			200: {
				description: "Auth",
				content: {
					"text/plain": {
						schema: z.string(),
					},
				},
			},
			401: unauthorizedResponse,
		},
		middleware: authMiddleware({
			verifyUser: basicAuth,
		}),
		security: [
			{
				Basic: [],
			},
		],
		operationId: "getAuth",
	}),
	async (c) => {
		const { logn } = c.var.user;
		return c.text(logn);
	},
);
app.openapi(
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
		security: [
			{
				Basic: [],
			},
		],
		operationId: "getAdmin",
	}),
	async (c) => {
		const fileContent = await Bun.file(
			new URL(import.meta.resolve("./admin.html")),
		).text();

		return c.body(fileContent, {
			headers: {
				"Content-Type": "text/html",
			},
		});
	},
);
app.openapi(
	createRoute({
		method: "get",
		path: "/mark",
		middleware: authMiddleware({
			verifyUser: basicAuth,
			roles: ["admin"],
		}),
		security: [
			{
				Basic: [],
			},
		],
		responses: {
			204: {
				description: "OK",
			},
		},
		request: {
			query: z.object({
				id: z.coerce.number().openapi({
					param: {
						name: "id",
						in: "query",
						required: true,
					},
				}),
				ok: z.coerce.boolean().openapi({
					param: {
						name: "ok",
						in: "query",
						required: true,
					},
				}),
			}),
		},
		operationId: "manualJudge",
	}),
	async (c) => {
		const { ok, id } = c.req.valid("query");

		await manualJudge(id, ok);
		return c.body(null, { status: 204 });
	},
);
app.openapi(
	createRoute({
		method: "get",
		path: "/void",
		middleware: authMiddleware({
			verifyUser: basicAuth,
			roles: [null],
		}),
		security: [
			{
				Basic: [],
			},
		],
		responses: {
			204: {
				description: "OK",
			},
			401: unauthorizedResponse,
			403: forbiddenResponse,
		},
		operationId: "void",
	}),
	async (c) => {
		return c.body(null, { status: 204 });
	},
);

app.on(["GET", "POST"], yoga.graphqlEndpoint, graphqlWsMiddleware, (c) =>
	yoga.fetch(c.req.raw, { c }),
);

for (const dir of competionData.server?.public ?? []) {
	const relativeDirPath = path.relative(process.cwd(), root);
	app.get(
		`/${dir}/*`,
		serveStatic({
			root: relativeDirPath,
			onNotFound: (path, c) =>
				console.error(`${path} is not found for ${c.req.path}`),
		}),
	);
}

app.doc31("/docs/json", (c) => ({
	info: {
		title: "FuzzJudge API",
		description: "FuzzJudge API",
		version: "0.1.0",
	},
	openapi: "3.1.0",
	tags: [
		{
			name: "Problems",
			description: "Problem related endpoints",
		},
		{
			name: "Competition",
			description: "Competition related endpoints",
		},
		{
			name: "Users",
			description: "User related endpoints",
		},
		{
			name: "Team",
			description: "Team related endpoints",
		},
	],
	servers: [
		{
			url: new URL(c.req.url).origin,
			description: "Current environment",
		},
	],
}));

app.openAPIRegistry.registerComponent("securitySchemes", "Basic", {
	type: "http",
	scheme: "basic",
});

app.use(logger());

export default app;

export type AppType = typeof app;
