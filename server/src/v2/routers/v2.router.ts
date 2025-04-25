import { OpenAPIHono } from "@hono/zod-openapi";
import { competitionRouter } from "./competition.router";

export const v2Router = new OpenAPIHono().route(
	"/competition",
	competitionRouter,
);
