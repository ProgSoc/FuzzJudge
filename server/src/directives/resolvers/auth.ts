import type { GraphQLContext } from "@/context";
import type { DirectiveResolvers } from "@/schema/types.generated";
import { GraphQLError } from "graphql";

export const auth: DirectiveResolvers["auth"] = async (
	next,
	_parent,
	{ role },
	context: GraphQLContext,
	_info,
) => {
	const { user } = context;

	if (!user) {
		throw new GraphQLError("Unauthorized", {
			extensions: {
				http: {
					status: 401,
				},
			},
		});
	}

	if (
		user.role !== "admin" && // Admins can access everything
		role !== user.role // Check if the user's role matches the required role
	) {
		throw new GraphQLError("Forbidden", {
			extensions: {
				http: {
					status: 403,
				},
			},
		});
	}

	return next();
};
