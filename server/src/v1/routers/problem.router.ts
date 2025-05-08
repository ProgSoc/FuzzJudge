import path from "node:path";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { serveStatic } from "hono/bun";
import { competitionRoot } from "../../config";
import { basicAuth } from "../../services/auth.service";
import {
	fuzzProblem,
	getProblems,
	judgeProblem,
} from "../../services/problems.service";
import { postSubmission, solved } from "../../services/submission.service";
import { getUserTeam } from "../../services/team.service";
import {
	authMiddleware,
	unauthorizedResponse,
} from "../middleware/auth.middleware";

const root = competitionRoot;

const problems = await getProblems(root);

const ProblemIdParamsSchema = z
	.object({
		id: z.string().openapi({
			param: {
				name: "id",
				in: "path",
			},
			example: "hello-world",
		}),
	})
	.openapi("ProblemIdParams");

export const probRouter = new OpenAPIHono()
	.openapi(
		createRoute({
			tags: ["Problems"],
			path: "/",
			method: "get",
			responses: {
				200: {
					content: {
						"text/csv": {
							schema: z.string(),
						},
					},
					description: "List of all problems slugs seperated by commas",
				},
			},
			operationId: "getProblems",
		}),
		(c) => {
			return c.text(problems.map((v) => `${v.slug}\n`).join(""));
		},
	)
	.openapi(
		createRoute({
			tags: ["Problems"],
			method: "get",
			path: "/{id}/icon",
			request: {
				params: ProblemIdParamsSchema,
			},
			responses: {
				200: {
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
					description: "Icon of the problem (emoji)",
				},
				404: {
					description: "Problem not found",
				},
			},
			operationId: "getProblemIcon",
		}),
		(c) => {
			const { id } = c.req.valid("param");

			const problem = problems.find(({ slug }) => slug === id);

			if (!problem) return c.notFound();

			const { icon } = problem.attributes;

			return c.text(icon);
		},
	)
	.openapi(
		createRoute({
			tags: ["Problems"],
			path: "/{id}/name",
			method: "get",
			request: {
				params: ProblemIdParamsSchema,
			},
			responses: {
				200: {
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
					description: "Name of the problem",
				},
				404: {
					description: "Problem not found",
				},
			},
			operationId: "getProblemName",
		}),
		(c) => {
			const { id } = c.req.valid("param");
			const problem = problems.find(({ slug }) => slug === id);

			if (!problem) return c.notFound();

			const { title } = problem.attributes;

			return c.text(title);
		},
	)
	.openapi(
		createRoute({
			tags: ["Problems"],
			path: "/{id}/brief",
			method: "get",
			request: {
				params: ProblemIdParamsSchema,
			},
			responses: {
				200: {
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
					description: "Brief description of the problem",
				},
				404: {
					description: "Problem not found",
				},
			},
			operationId: "getProblemBrief",
		}),
		(c) => {
			const { id } = c.req.valid("param");

			const problem = problems.find(({ slug }) => slug === id);

			if (!problem) return c.notFound();

			const { summary } = problem.attributes;

			return c.text(summary ?? "");
		},
	)
	.openapi(
		createRoute({
			tags: ["Problems"],
			path: "/{id}/difficulty",
			method: "get",
			request: {
				params: ProblemIdParamsSchema,
			},
			responses: {
				200: {
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
					description: "Difficulty of the problem",
				},
				404: {
					description: "Problem not found",
				},
			},
			operationId: "getProblemDifficulty",
		}),
		(c) => {
			const { id } = c.req.valid("param");
			const problem = problems.find(({ slug }) => slug === id);

			if (!problem) return c.notFound();

			return c.text(problem.problem.difficulty.toString());
		},
	)
	.openapi(
		createRoute({
			tags: ["Problems"],
			path: "/{id}/points",
			method: "get",
			request: {
				params: ProblemIdParamsSchema,
			},
			responses: {
				200: {
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
					description: "Points of the problem",
				},
				404: {
					description: "Problem not found",
				},
			},
			operationId: "getProblemPoints",
		}),
		(c) => {
			const { id } = c.req.valid("param");
			const problem = problems.find(({ slug }) => slug === id);

			if (!problem) return c.notFound();

			return c.text(problem.problem.points.toString());
		},
	)
	.openapi(
		createRoute({
			tags: ["Problems"],
			method: "get",
			path: "/{id}/solution",
			request: {
				params: ProblemIdParamsSchema,
			},
			responses: {
				451: {
					description: "Unavailable for legal reasons",
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
				},
			},
			operationId: "getProblemSolution",
		}),
		(c) => {
			return c.text("451 Unavailable For Legal Reasons", { status: 451 });
		},
	)
	.openapi(
		createRoute({
			tags: ["Problems"],
			path: "/{id}/instructions",
			method: "get",
			request: {
				params: ProblemIdParamsSchema,
			},
			security: [
				{
					Basic: [],
				},
			],
			responses: {
				200: {
					content: {
						"text/markdown": {
							schema: z.string(),
						},
					},
					description: "Instructions of the problem",
				},
				404: {
					description: "Problem not found",
				},
				401: unauthorizedResponse,
			},
			middleware: [
				authMiddleware({
					verifyUser: basicAuth,
				}),
			],
			operationId: "getProblemInstructions",
		}),

		async (c) => {
			// clock.protect();

			const { id } = c.req.valid("param");
			const problem = problems.find(({ slug }) => slug === id);
			if (!problem) return c.notFound();

			const { body } = problem.attributes;

			return c.body(body, {
				headers: { "Content-Type": "text/markdown" },
			});
		},
	)
	.openapi(
		createRoute({
			tags: ["Problems"],
			method: "get",
			path: "/{id}/fuzz",
			request: {
				params: ProblemIdParamsSchema,
			},
			responses: {
				200: {
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
					description: "Fuzzed input for the problem",
				},
				404: {
					description: "Problem not found",
				},
				403: {
					description: "User not in a team",
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
			operationId: "getProblemFuzz",
		}),

		async (c) => {
			// clock.protect();
			const user = c.var.user;
			const userTeam = await getUserTeam(user.id);
			const { id } = c.req.valid("param");

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
		},
	)
	.openapi(
		createRoute({
			tags: ["Problems"],
			method: "get",
			path: "/{id}/judge",
			request: {
				params: ProblemIdParamsSchema,
			},
			responses: {
				200: {
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
					description: "Judgement of the problem",
				},
				404: {
					description: "Problem not found",
				},
				403: {
					description: "User not in a team",
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
			operationId: "getProblemJudge",
		}),
		async (c) => {
			// clock.protect();
			const user = c.var.user;

			if (!user.team) {
				return c.body("403 Forbidden\n\nUser not in a team.\n", {
					status: 403,
				});
			}

			const { id } = c.req.valid("param");

			const problemSolved = await solved({
				team: user.team,
				prob: id,
			});

			return c.text(problemSolved ? "OK" : "Not Solved");
		},
	)
	.openapi(
		createRoute({
			tags: ["Problems"],
			path: "/{id}/judge",
			method: "post",
			request: {
				params: ProblemIdParamsSchema,
				body: {
					content: {
						"application/x-www-form-urlencoded": {
							schema: z.object({
								output: z.string().openapi({ example: "Hello World!" }),
								source: z
									.string()
									.openapi({ example: "print('Hello World!')" }),
							}),
						},
					},
				},
			},
			responses: {
				200: {
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
					description: "Judgement of the problem",
				},
				404: {
					description: "Problem not found",
				},
				403: {
					description: "User not in a team",
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
				},
				401: unauthorizedResponse,
				409: {
					description: "Problem already solved",
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
				},
				400: {
					description: "Bad Request",
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
				},
				422: {
					description: "Unprocessable Content (Invalid submission)",
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
				},
				415: {
					description:
						"Unsupported Media Type (Expected application/x-www-form-urlencoded)",
					content: {
						"text/plain": {
							schema: z.string(),
						},
					},
				},
			},
			middleware: authMiddleware({
				verifyUser: basicAuth,
			}),
			security: [
				{
					Basic: [],
				},
			],
			operationId: "postProblemJudge",
		}),

		async (c) => {
			// clock.protect();
			const user = c.var.user;
			const { id } = c.req.valid("param");
			const { output: submissionOutput, source: submissionCode } =
				c.req.valid("form");

			const userTeam = await getUserTeam(user.id);

			if (!userTeam) {
				return c.body("403 Forbidden\n\nUser not in a team.\n", {
					status: 403,
				});
			}

			if (await solved({ team: userTeam.id, prob: id })) {
				return c.body("409 Conflict\n\nProblem already solved.\n", {
					status: 409,
				});
			}

			const time = new Date();

			const { seed } = userTeam;

			const problem = problems.find(({ slug }) => slug === id);

			if (!problem) return c.notFound();

			const t0 = performance.now();
			const submission = await judgeProblem(
				root,
				problem.slug,
				seed,
				submissionOutput,
			);
			const t1 = performance.now();

			const { correct } = submission;

			if (correct) {
				await postSubmission({
					team: userTeam.id,
					prob: id,
					time: time.toString(),
					out: submissionOutput,
					code: submissionCode,
					ok: submission.correct,
					vler: "",
					vlms: t1 - t0,
				});

				console.log(`✅ Problem ${id} solved by ${user.name}`);

				return c.text("Approved! ✅\n");
			}

			const { errors } = submission;

			await postSubmission({
				team: userTeam.id,
				prob: id,
				time: time.toString(),
				out: submissionOutput,
				code: submissionCode,
				ok: correct,
				vler: errors,
				vlms: t1 - t0,
			});

			console.log(`❌ Problem ${id} rejected by ${user.name}`);

			return c.body(
				`422 Unprocessable Content\n\nSolution rejected.\n\n${errors}\n`,
				{ status: 422 },
			);
		},
	)
	.openapi(
		createRoute({
			tags: ["Problems"],
			path: "/{id}/assets/*",
			method: "get",
			request: {
				params: ProblemIdParamsSchema,
			},
			responses: {
				200: {
					description: "Assets of the problem",
				},
				404: {
					description: "Problem not found",
				},
			},
			middleware: [
				authMiddleware({
					verifyUser: basicAuth,
				}),
			],
			security: [
				{
					Basic: [],
				},
			],
			operationId: "getProblemAssets",
		}),
		async (c, next) => {
			const { id } = c.req.valid("param");
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
		},
	);
