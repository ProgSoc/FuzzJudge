import type { AuthenticatedContext, GraphQLContext } from "@/context";
import type { DirectiveResolvers } from "@/schema/types.generated";
import { GraphQLError } from "graphql";

export const auth: DirectiveResolvers["auth"] = async (
	next,
	parent,
	args,
	context: GraphQLContext & Partial<AuthenticatedContext<GraphQLContext>>,
	info,
) => {
	const user = context.c.get("user");

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
