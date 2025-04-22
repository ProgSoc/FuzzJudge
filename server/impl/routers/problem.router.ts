import path from "node:path";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { serveStatic } from "hono/bun";
import {
	authMiddleware,
	unauthorizedResponse,
} from "../middleware/auth.middleware";
import { basicAuth } from "../services/auth.service";
import {
	fuzzProblem,
	getProblems,
	judgeProblem,
} from "../services/problems.service";
import { postSubmission, solved } from "../services/submission.service";
import { getUserTeam } from "../services/team.service";

const root = Bun.env.COMPETITION_PATH;

if (!root) {
	throw new Error("COMPETITION_PATH env not set");
}

const problems = await getProblems(root);

const ProblemIdParamsSchema = z.object({
	id: z.string().openapi({
		param: {
			name: "id",
			in: "path",
		},
		example: "hello-world",
	}),
});

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
		}),
		(c) => {
			const id = c.req.param("id");

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
		}),
		(c) => {
			const id = c.req.param("id");
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
		}),
		(c) => {
			const id = c.req.param("id");

			const problem = problems.find(({ slug }) => slug === id);

			if (!problem) return c.notFound();

			const { summary } = problem.attributes;

			return c.text(summary ?? "");
		},
	)
	.openapi(
		createRoute({
			tags: ["Problems"],
			path: "{id}/difficulty",
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
		}),
		(c) => {
			const id = c.req.param("id");
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
		}),
		(c) => {
			const id = c.req.param("id");
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
		}),

		async (c) => {
			// clock.protect();

			const id = c.req.param("id");
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
		}),

		async (c) => {
			// clock.protect();
			const user = c.var.user;
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

			return c.text(
				(await solved({ team: user.team, prob: id })) ? "OK" : "Not Solved",
			);
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
		}),

		async (c) => {
			// clock.protect();
			const user = c.var.user;
			const { id } = c.req.valid("param");

			if (!user.team) {
				return c.body("403 Forbidden\n\nUser not in a team.\n", {
					status: 403,
				});
			}

			if (await solved({ team: user.team, prob: id })) {
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
					{
						status: 400,
					},
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
					team: user.team,
					prob: id,
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
				prob: id,
				time: time.toString(),
				out: submissionOutput,
				code: submissionCode,
				ok: correct,
				vler: errors,
				vlms: t1 - t0,
			});

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
			middleware: authMiddleware({
				verifyUser: basicAuth,
			}),
			security: [
				{
					Basic: [],
				},
			],
		}),
		async (c, next) => {
			// clock.protect();
			const probId = c.req.param("id");

			const serveStaticResponse = await serveStatic({
				root: path.join(root, "problems", probId, "assets"),
			})(c, next);

			if (serveStaticResponse instanceof Response) {
				return serveStaticResponse;
			}

			return c.notFound();
		},
	);
