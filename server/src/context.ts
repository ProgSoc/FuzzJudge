import type { Context as HonoContext, Env as HonoEnv } from "hono";
import type { User } from "./db/schema";

interface Env extends HonoEnv {
	Variables: {
		user?: User;
	};
}

export type GraphQLContext = { c: HonoContext<Env> };
