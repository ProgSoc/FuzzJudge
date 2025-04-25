import { z } from "@hono/zod-openapi";

export const TeamSchema = z
	.object({
		id: z.number(),
		name: z.string(),
		seed: z.string(),
	})
	.openapi("Team");
