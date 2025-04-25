import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { getCompetitionData } from "server/src/services/competition.service";

const CompetitionTimesSchema = z
	.object({
		freeze: z.number(),
		start: z.string().datetime(),
		end: z.string().datetime(),
	})
	.openapi("CompetitionTimes");

export const competitionRouter = new OpenAPIHono().openapi(
	createRoute({
		method: "get",
		operationId: "getCompetition",
		path: "/",
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.object({
							content: z.string(),
							title: z.string(),
							times: CompetitionTimesSchema,
						}),
					},
				},
				description: "Get the competition details",
			},
			500: {
				description: "No competition path defined",
			},
		},
	}),
	async (c) => {
		const competitionPath = Bun.env.COMPETITION_PATH;
		if (!competitionPath) {
			throw new HTTPException(500, {
				message: "No competition path specificed in server.",
			});
		}

		const { content, times, title } = await getCompetitionData(competitionPath);

		return c.json(
			{
				content,
				times,
				title,
			},
			200,
		);
	},
);
