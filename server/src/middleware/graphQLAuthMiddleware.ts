import type { GraphQLContext } from "@/context";
import type { User } from "@/db/schema";
import { GraphQLError } from "graphql";
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

		// if (!basicCredentials) {
		//     return c.body("401 Unauthorized", {
		//         status: 401,
		//         headers: {
		//             "WWW-Authenticate": `Basic realm="FuzzJudge" charset="utf-8"`,
		//         },
		//     });
		// }

		if (!basicCredentials) return next();

		const { username, password } = basicCredentials;
		const user = await options.verifyUser(username, password);

		if (!user) return next();

		c.set("user", user);

		return next();
	});

const forceAuth = () =>
	new GraphQLError("User not found", {
		extensions: {
			http: {
				status: 401,
				headers: {
					"WWW-Authenticate": `Basic realm="FuzzJudge" charset="utf-8"`,
				},
			},
		},
	});

export const ensureRole = (c: GraphQLContext["c"], roles?: User["role"][]) => {
	const { user } = c.var;

	if (!user) {
		throw forceAuth();
	}

	if (!roles?.length || roles.includes(user.role)) {
		return user;
	}

	throw new GraphQLError("Forbidden", {
		extensions: {
			http: {
				status: 403,
			},
		},
	});
};
