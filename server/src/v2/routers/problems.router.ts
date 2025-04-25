import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import {
	authMiddleware,
	unauthorizedResponse,
} from "../../middleware/auth.middleware";
import { basicAuth } from "../../services/auth.service";
import { getProblemData, getProblems } from "../../services/problems.service";
import { solvedSet } from "../../services/submission.service";

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

		const q = await getProblemData(competitionPath, id);

		return c.json(
			{
				icon: q.attributes.icon,
				title: q.attributes.title,
				points: q.problem.points,
				slug: q.slug,
				difficulty: q.problem.difficulty,
				solved: completedProblems.has(q.slug),
				content: q.content,
			},
			200,
		);
	});
