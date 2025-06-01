import type { User } from "@/db/schema";
import { createMiddleware } from "hono/factory";
import { auth } from "hono/utils/basic-auth";

interface CustomBasicAuthOptions<T extends User> {
	verifyUser: (username: string, password: string) => Promise<T | null>;
}

export const graphqlAuthMiddleware = <T extends User>(
	options: CustomBasicAuthOptions<T>,
) =>
	createMiddleware<{
		Variables: {
			user: T;
		};
	}>(async (c, next) => {
		const basicCredentials = auth(c.req.raw);

		if (!basicCredentials) return next();

		const { username, password } = basicCredentials;
		const user = await options.verifyUser(username, password);

		if (!user) return next();

		c.set("user", user);

		return next();
	});
