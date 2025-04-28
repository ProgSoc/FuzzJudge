import { OpenAPIHono } from "@hono/zod-openapi";
import { competitionRouter } from "./competition.router";
import { problemsRouter } from "./problems.router";

export const v2Router = new OpenAPIHono()
	.route("/competition", competitionRouter)
	.route("/problems", problemsRouter);
