import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { clock } from "../../app";
import { ee } from "../../ee";
import {
	authMiddleware,
	forbiddenResponse,
	unauthorizedResponse,
} from "../../middleware/auth.middleware";
import { basicAuth } from "../../services/auth.service";
import { getCompetitionData } from "../../services/competition.service";
import { allMeta } from "../../services/meta.service";
import { oldScoreboard } from "../../services/scoreboard.service";
import {
	SubmissionSkeletonSchema,
	getSubmissionCode,
	getSubmissionOut,
	getSubmissionSkeletons,
	getSubmissionVler,
} from "../../services/submission.service";
import { upgradeWebSocket } from "../../websocket";
import type { CompetitionClockMessage } from "../clock";
import { probRouter } from "./problem.router";

const root = Bun.env.COMPETITION_PATH;
if (!root) {
	throw new Error("COMPETITION_PATH env not set");
}

const competionData = await getCompetitionData(root);

export const compRouter = new OpenAPIHono()
	.route("/prob", probRouter)
	.openapi(
		createRoute({
			tags: ["Competition"],
			method: "get",
			path: "/meta",
			operationId: "getMeta",
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
				403: forbiddenResponse,
			},
			middleware: authMiddleware({
				verifyUser: basicAuth,
				roles: ["admin"],
			}),
			security: [
				{
					Bearer: [],
				},
			],
		}),
		async (c) => {
			const meta = await allMeta();
			return c.json(meta, {
				headers: { "Content-Type": "application/json" },
				status: 200,
			});
		},
	)
	.openapi(
		createRoute({
			tags: ["Competition"],
			path: "/submissions",
			operationId: "getSubmissions",
			method: "get",
			middleware: authMiddleware({
				verifyUser: basicAuth,
				roles: ["admin"],
			}),
			security: [
				{
					Bearer: [],
				},
			],
			responses: {
				200: {
					content: {
						"application/json": {
							schema: z.array(SubmissionSkeletonSchema),
						},
					},
					description: "Submission skeletons",
				},
				401: unauthorizedResponse,
				403: forbiddenResponse,
			},
			request: {
				query: z.object({
					team: z.coerce.number().openapi({
						param: {
							in: "query",
							name: "team",
							required: true,
						},
					}),
					slug: z.string().openapi({
						param: {
							in: "query",
							name: "slug",
							required: true,
						},
					}),
				}),
			},
		}),
		async (c) => {
			const { slug, team } = c.req.valid("query");
			const submissionSkeletons = await getSubmissionSkeletons(team, slug);
			return c.json(submissionSkeletons, {
				headers: { "Content-Type": "application/json" },
				status: 200,
			});
		},
	)
	.openapi(
		createRoute({
			tags: ["Competition"],
			path: "/submission",
			method: "get",
			middleware: authMiddleware({
				verifyUser: basicAuth,
				roles: ["admin"],
			}),
			security: [
				{
					Bearer: [],
				},
			],
			responses: {
				200: {
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
					description: "submission output",
				},
				401: unauthorizedResponse,
				403: forbiddenResponse,
				404: {
					description: "Data not found",
				},
			},
			request: {
				query: z.object({
					kind: z.enum(["out", "code", "vler"]).openapi({
						param: {
							in: "query",
							name: "kind",
							required: true,
						},
					}),
					subm: z.coerce.number().openapi({
						param: {
							in: "query",
							name: "subm",
							required: true,
						},
					}),
				}),
			},
			operationId: "getSubmission",
		}),
		async (c) => {
			const { kind, subm } = c.req.valid("query");
			switch (kind) {
				case "out": {
					const subOut = await getSubmissionOut(subm);

					if (!subOut) return c.notFound();

					return c.text(subOut);
				}
				case "code": {
					const subCode = await getSubmissionCode(subm);

					if (!subCode) return c.notFound();

					return c.text(subCode);
				}
				case "vler": {
					const subVler = await getSubmissionVler(subm);

					if (!subVler) return c.notFound();

					return c.text(subVler);
				}
			}
		},
	)
	.openapi(
		createRoute({
			tags: ["Competition"],
			method: "get",
			path: "/name",
			responses: {
				200: {
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
					description: "Competition name",
				},
			},
			operationId: "getName",
		}),
		(c) => {
			return c.text(competionData.attributes.title ?? "FuzzJudge Competition");
		},
	)
	.openapi(
		createRoute({
			tags: ["Competition"],
			method: "get",
			path: "/brief",
			responses: {
				200: {
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
					description: "Competition brief",
				},
			},
			operationId: "getBrief",
		}),
		(c) => {
			return c.text(competionData.attributes.summary ?? "");
		},
	)
	.openapi(
		createRoute({
			tags: ["Competition"],
			path: "/instructions",
			method: "get",
			responses: {
				200: {
					content: {
						"text/html": {
							schema: z.string(),
						},
					},
					description: "The problem instructions",
				},
			},
			operationId: "getInstructions",
		}),
		(c) => {
			return c.body(competionData.attributes.body, {
				headers: { "Content-Type": "text/html" },
			});
		},
	)
	.openapi(
		createRoute({
			tags: ["Competition"],
			method: "get",
			path: "/scoreboard",
			responses: {
				200: {
					content: {
						"text/csv": {
							schema: z.string(),
						},
					},
					description: "scoreboard csv",
				},
			},
			operationId: "getScoreboard",
		}),
		async (c) => {
			// clock.protect([CompState.BEFORE, CompState.LIVE_WITH_SCORES]);
			return c.body(await oldScoreboard(root), {
				headers: { "Content-Type": "text/csv" },
			});
		},
	)
	.openapi(
		createRoute({
			tags: ["Competition"],
			method: "get",
			path: "/clock",
			responses: {
				101: {
					description: "Websocket upgrade",
				},
				500: {
					description: "Upgrade failed",
				},
			},
			operationId: "getClock",
		}),
		async (c, next) => {
			const wsUpgrade = await upgradeWebSocket((c) => {
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
			})(c, next);

			if (wsUpgrade) {
				return wsUpgrade;
			}

			return c.body("Upgrade failed", { status: 500 });
		},
	)
	.openapi(
		createRoute({
			tags: ["Competition"],
			method: "patch",
			path: "/clock",
			middleware: authMiddleware({
				verifyUser: basicAuth,
				roles: ["admin"],
			}),
			security: [
				{
					Bearer: [],
				},
			],
			responses: {
				204: {
					description: "Success",
				},
				401: unauthorizedResponse,
				403: forbiddenResponse,
			},
			request: {
				body: {
					content: {
						"application/x-www-form-urlencoded": {
							schema: z.object({
								kind: z.enum(["start", "finish"]).openapi({
									param: {
										required: true,
										name: "kind",
									},
								}),
								time: z.coerce.date().openapi({
									param: {
										required: true,
										name: "time",
									},
								}),
								keep: z.coerce
									.boolean()
									.optional()
									.openapi({
										param: {
											name: "keep",
											required: false,
										},
									}),
							}),
						},
					},
				},
			},
			operationId: "patchClock",
		}),
		async (c) => {
			const { kind, time, keep } = c.req.valid("form");
			if (kind === "start") {
				await clock.adjustStart(time, {
					keepDuration: !!keep,
				});
			} else {
				await clock.adjustFinish(time);
			}
			return c.body(null, { status: 200 });
		},
	);
