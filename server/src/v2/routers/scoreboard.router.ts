import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import {
	ScoreboardSchema,
	calculateScoreboard,
} from "../../services/score.service";

const scoreboardRoute = createRoute({
	method: "get",
	path: "/",
	description: "Get scoreboard",
	responses: {
		200: {
			description: "Scoreboard",
			content: {
				"application/json": {
					schema: ScoreboardSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
		},
		403: {
			description: "Forbidden",
		},
	},
});

export const scoreboardRouter = new OpenAPIHono().openapi(
	scoreboardRoute,
	async (c) => {
		const root = Bun.env.COMPETITION_PATH;

		if (!root) {
			throw new HTTPException(500, { message: "Competition path not set" });
		}

		const startTime = new Date(); // TODO: Get the actual start time of the competition

		const scoreboard = await calculateScoreboard(root, startTime);

		return c.json(scoreboard, 200);
	},
);
