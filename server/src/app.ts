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

import path from "node:path";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import { createSchema, createYoga } from "graphql-yoga";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { competitionRoot } from "./config.ts";
import { migrateDB } from "./db/index.ts";

import { graphqlAuthMiddleware } from "./middleware/graphQLAuthMiddleware.ts";
import { makeWebsocketGraphQLMiddleware } from "./middleware/graphqlWs.middleware.ts";
import { resolvers } from "./schema/resolvers.generated";
import { typeDefs } from "./schema/typeDefs.generated";
import { basicAuth } from "./services/auth.service.ts";
import { getCompetitionData } from "./services/competition.service.ts";
import { getProblems } from "./services/problems.service.ts";
import { resetUser } from "./services/user.service.ts";
import { createClock } from "./v1/clock.ts";
import { upgradeWebSocket } from "./websocket.ts";

migrateDB();

const root = competitionRoot;

const problems = await getProblems(root);
const competionData = await getCompetitionData(root);

resetUser({ logn: "admin", role: "admin" }, false);

export const clock = await createClock(
	competionData.times.start ?? new Date(),
	competionData.times.finish ?? new Date(Date.now() + 180 * 60 * 1000), // 3 hrs
);

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

const basePath = Bun.env.BASE_PATH ?? "/";
const app = new OpenAPIHono().basePath(basePath as "/");

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

app.on(
	["GET", "POST"],
	yoga.graphqlEndpoint,
	graphqlAuthMiddleware({
		verifyUser: basicAuth,
	}),
	graphqlWsMiddleware,
	(c) => yoga.fetch(c.req.raw, { c }),
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
