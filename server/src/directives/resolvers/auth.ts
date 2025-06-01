import type { AuthenticatedContext, GraphQLContext } from "@/context";
import type { DirectiveResolvers } from "@/schema/types.generated";
import { basicAuth } from "@/services/auth.service";
import { GraphQLError } from "graphql";
import { auth as honoAuth } from "hono/utils/basic-auth";

export const auth: DirectiveResolvers["auth"] = async (
	next,
	parent,
	args,
	context: GraphQLContext & Partial<AuthenticatedContext<GraphQLContext>>,
	info,
) => {
	const basicCredentials = honoAuth(context.c.req.raw);
	if (!basicCredentials)
		throw new GraphQLError("Unauthorized", {
			extensions: {
				http: {
					status: 401,
					headers: {
						"WWW-Authenticate": `Basic realm="FuzzJudge" charset="utf-8"`,
					},
				},
			},
		});

	const { username, password } = basicCredentials;
	const user = await basicAuth(username, password);

	if (!user) {
		throw new GraphQLError("Unauthorized", {
			extensions: {
				http: {
					status: 401,
					headers: {
						"WWW-Authenticate": `Basic realm="FuzzJudge" charset="utf-8"`,
					},
				},
			},
		});
	}

	if (
		user.role !== "admin" && // Admins can access everything
		args.role !== user.role // Check if the user's role matches the required role
	) {
		throw new GraphQLError("Forbidden", {
			extensions: {
				http: {
					status: 403,
					headers: {
						"WWW-Authenticate": `Basic realm="FuzzJudge" charset="utf-8"`,
					},
				},
			},
		});
	}

	context.user = user;

	return next();
};
