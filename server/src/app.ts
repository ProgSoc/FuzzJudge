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

import { createSchema, createYoga } from "graphql-yoga";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { competitionRoot } from "./config.ts";
import { migrateDB } from "./db/index.ts";

import { Hono } from "hono";
import { graphqlAuthMiddleware } from "./middleware/graphQLAuthMiddleware.ts";
import { makeWebsocketGraphQLMiddleware } from "./middleware/graphqlWs.middleware.ts";
import { resolvers } from "./schema/resolvers.generated";
import { typeDefs } from "./schema/typeDefs.generated";
import { basicAuth } from "./services/auth.service.ts";
import { getCompetitionData } from "./services/competition.service.ts";
import { resetUser } from "./services/user.service.ts";
import { createClock } from "./v1/clock.ts";
import { upgradeWebSocket } from "./websocket.ts";

migrateDB();

const root = competitionRoot;

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
const app = new Hono().basePath(basePath as "/");

app.on(["BREW"], "/", async (c) => {
	return c.text("I'm a teapot", 418);
});

app.on(
	// Allowed methods for the GraphQL endpoint
	["GET", "POST"],
	// GraphQL endpoint
	yoga.graphqlEndpoint,
	// GraphQL Auth to get the user from basic auth
	graphqlAuthMiddleware({
		verifyUser: basicAuth,
	}),
	// GraphQL WebSocket upgrade if the request is a WebSocket
	graphqlWsMiddleware,
	// GraphQL Yoga server
	(c) => yoga.fetch(c.req.raw, { c }),
);

app.use("/comp/prob/:slug/assets", async (c, next) => {
	const id = c.req.param("slug");
	const probPath = path.join(id, "assets");
	const rootPath = path.join(root, probPath);

	const serveStaticResponse = await serveStatic({
		root: rootPath,
		rewriteRequestPath: (req) => {
			const pathIndex = req.indexOf(probPath);
			if (pathIndex === -1) {
				return req;
			}
			return req.slice(pathIndex + probPath.length);
		},
	})(c, next);

	if (serveStaticResponse instanceof Response) {
		return serveStaticResponse;
	}

	return c.notFound();
});

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

app.use(logger());

export default app;
