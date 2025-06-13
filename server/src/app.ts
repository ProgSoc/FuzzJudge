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
import { competitionRoot } from "./config";

import { Hono } from "hono";
import { makeWebsocketGraphQLMiddleware } from "./middleware/graphqlWs.middleware";
import { resolvers } from "./schema/resolvers.generated";
import { typeDefs } from "./schema/typeDefs.generated";
import { getCompetitionData } from "./services/competition.service";
import { upgradeWebSocket } from "./websocket";

const root = competitionRoot;

const competionData = await getCompetitionData(root);
import { readdir } from "node:fs/promises";
import { getCurrentSession } from "./auth/session";
import { attachDirectiveResolvers } from "./directives/attachDirectiveResolvers";
import { directiveResolvers } from "./directives/directiveResolvers";

const schema = attachDirectiveResolvers(
	createSchema({
		typeDefs,
		resolvers,
	}),
	directiveResolvers,
);

const graphqlWsMiddleware = makeWebsocketGraphQLMiddleware({
	upgradeWebSocket,
	schema,
	context: async ({ extra: { c } }) => {
		const authenticationResult = await getCurrentSession(c);
		return { c, ...authenticationResult };
	},
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
	// GraphQL WebSocket upgrade if the request is a WebSocket
	graphqlWsMiddleware,
	// GraphQL Yoga server
	async (c) => {
		const authenticationResult = await getCurrentSession(c);
		const yogaRes = await yoga.fetch(c.req.raw, {
			...authenticationResult,
			c,
		});
		return c.newResponse(yogaRes.body, yogaRes);
	},
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

// All clients have their own folder under clients/ that contains an index.html, if not found return that index.html

const clientFolders = await readdir(path.join(import.meta.dir, "clients"));

for (const folder of clientFolders) {
	app
		.use(
			`/clients/${folder}/*`,
			serveStatic({
				root: import.meta.dir,
			}),
		)
		.use(
			`/clients/${folder}/*`,
			serveStatic({
				root: import.meta.dir,
				path: `clients/${folder}/index.html`,
			}),
		);
}

app.use(logger());

export default app;
