import type { Context } from "hono";
import type { SessionValidationResult, SessionWithUser } from "./auth/session";

export type GraphQLContext = SessionValidationResult & { c: Context };

export type AuthenticatedContext<Context> = Context & SessionWithUser;
