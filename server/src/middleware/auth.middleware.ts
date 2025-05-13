import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";
import { z } from "@hono/zod-openapi";
import { createMiddleware } from "hono/factory";
import { auth } from "hono/utils/basic-auth";
import type { User } from "../db/schema";

interface CustomBasicAuthOptions<T extends User> {
	verifyUser: (username: string, password: string) => Promise<T | null>;
	required?: boolean;
	roles?: T["role"][];
}

export const authMiddleware = <T extends User>({
	required = true,
	verifyUser,
	roles,
}: CustomBasicAuthOptions<T>) =>
	createMiddleware<{
		Variables: {
			user: T;
		};
	}>(async (c, next) => {
		const basicCredentials = auth(c.req.raw);

		if (!basicCredentials) {
			return c.body("401 Unauthorized", {
				status: 401,
				headers: {
					"WWW-Authenticate": `Basic realm="FuzzJudge" charset="utf-8"`,
				},
			});
		}

		const { username, password } = basicCredentials;
		const user = await verifyUser(username, password);

		if (!user && required) {
			return c.body("401 Unauthorized", {
				status: 401,
				headers: {
					"WWW-Authenticate": `Basic realm="FuzzJudge" charset="utf-8"`,
				},
			});
		}

		if (roles?.length && user && !roles.includes(user.role)) {
			return c.body("403 Forbidden", {
				status: 403,
			});
		}

		if (user) {
			c.set("user", user);
		}

		return next();
	});

export const forbiddenResponse = {
	description: "Forbidden",
	content: {
		"text/plain": {
			schema: z.string(),
		},
	},
} satisfies ResponseConfig;

export const unauthorizedResponse = {
	description: "Unauthorized",
	content: {
		"text/plain": {
			schema: z.string(),
		},
	},
} satisfies ResponseConfig;
