import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { db } from "server/src/db";
import { getUserTeam } from "server/src/services/team.service";
import {
	authMiddleware,
	unauthorizedResponse,
} from "../../middleware/auth.middleware";
import { basicAuth } from "../../services/auth.service";
import {
	fuzzProblem,
	getProblemData,
	getProblems,
	judgeProblem,
} from "../../services/problems.service";
import {
	postSubmission,
	solved,
	solvedSet,
} from "../../services/submission.service";

const ProblemItemSchema = z
	.object({
		icon: z.string(),
		title: z.string(),
		points: z.number(),
		difficulty: z.number(),
		solved: z.boolean(),
		slug: z.string(),
	})
	.openapi("ProblemItem");

const ProblemDetailsSchema = ProblemItemSchema.extend({
	content: z.string(),
	fuzzInput: z.string().optional(),
}).openapi("ProblemDetails");

const problemsRoute = createRoute({
	method: "get",
	path: "/",
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.array(ProblemItemSchema),
				},
			},
			description: "",
		},
		401: unauthorizedResponse,
		500: {
			description: "No competition path specified.",
		},
	},
	middleware: authMiddleware({
		verifyUser: basicAuth,
	}),
});

const ProblemParamSchema = z.object({
	id: z.string().openapi({
		param: {
			in: "path",
			name: "id",
		},
	}),
});

const problemRoute = createRoute({
	method: "get",
	path: "/{id}",
	request: {
		params: ProblemParamSchema,
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: ProblemDetailsSchema,
				},
			},
			description: "Problem content",
		},
		401: unauthorizedResponse,
	},
	middleware: authMiddleware({
		verifyUser: basicAuth,
	}),
});

const SolveProblemSchema = z
	.object({
		solutionOutput: z.string(),
		solutionFile: z.instanceof(File),
	})
	.openapi("SolveProblem");

const solveProblemRoute = createRoute({
	method: "post",
	path: "/{id}/solve",
	request: {
		params: ProblemParamSchema,
		body: {
			content: {
				"application/x-www-form-urlencoded": {
					schema: SolveProblemSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({
						correct: z.boolean(),
						message: z.string(),
					}),
				},
			},
			description: "Submission result",
		},
		401: unauthorizedResponse,
		500: {
			description: "No competition path specified.",
		},
		403: {
			description: "User not in a team.",
		},
		409: {
			description: "Problem already solved.",
		},
		422: {
			description: "Solution rejected.",
		},
	},
	middleware: authMiddleware({
		verifyUser: basicAuth,
	}),
});

export const problemsRouter = new OpenAPIHono()
	.openapi(problemsRoute, async (c) => {
		const competitionPath = Bun.env.COMPETITION_PATH;
		if (!competitionPath) {
			throw new HTTPException(500, {
				message: "No competition path specificed in server.",
			});
		}

		const questionData = await getProblems(competitionPath);

		const teamId = c.var.user?.team;

		const completedProblems = teamId
			? await solvedSet({ team: teamId })
			: new Set();

		const problemItems = questionData.map((q) => ({
			icon: q.attributes.icon,
			title: q.attributes.title,
			points: q.problem.points,
			slug: q.slug,
			difficulty: q.problem.difficulty,
			solved: completedProblems.has(q.slug),
		}));

		return c.json(problemItems, 200);
	})
	.openapi(problemRoute, async (c) => {
		const competitionPath = Bun.env.COMPETITION_PATH;
		if (!competitionPath) {
			throw new HTTPException(500, {
				message: "No competition path specificed in server.",
			});
		}

		const { id } = c.req.valid("param");

		const teamId = c.var.user?.team;

		const completedProblems = teamId
			? await solvedSet({ team: teamId })
			: new Set();

		const team = teamId
			? await db.query.teamTable.findFirst({
					where: (t, { eq }) => eq(t.id, teamId),
				})
			: null;

		const q = await getProblemData(competitionPath, id);

		const problemFuzz = team
			? await fuzzProblem(competitionPath, id, team.seed)
			: undefined;

		return c.json(
			{
				icon: q.attributes.icon,
				title: q.attributes.title,
				points: q.problem.points,
				slug: q.slug,
				difficulty: q.problem.difficulty,
				solved: completedProblems.has(q.slug),
				content: q.content,
				fuzzInput: problemFuzz,
			},
			200,
		);
	})
	.openapi(solveProblemRoute, async (c) => {
		const { id } = c.req.valid("param");
		const { solutionOutput, solutionFile } = c.req.valid("form");
		const root = Bun.env.COMPETITION_PATH;
		if (!root) {
			console.error("No competition path specified in server.");
			throw new HTTPException(500, {
				message: "No competition path specificed in server.",
			});
		}

		const user = c.var.user;

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

		const t0 = performance.now();
		const submission = await judgeProblem(root, id, seed, solutionOutput);
		const t1 = performance.now();

		const { correct } = submission;

		if (correct) {
			await postSubmission({
				team: userTeam.id,
				prob: id,
				time: time.toString(),
				out: solutionOutput,
				code: await solutionFile.text(),
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
			out: solutionOutput,
			code: await solutionFile.text(),
			ok: submission.correct,
			vler: "",
			vlms: t1 - t0,
		});

		console.log(`❌ Problem ${id} rejected by ${user.name}`);

		return c.body(
			`422 Unprocessable Content\n\nSolution rejected.\n\n${errors}\n`,
			{ status: 422 },
		);
	});
