import { db } from "@/db";
import { ensureRole } from "@/middleware/graphQLAuthMiddleware";
import { GraphQLError } from "graphql";
import type { QueryResolvers } from "./../../../types.generated";
export const user: NonNullable<QueryResolvers["user"]> = async (
	_parent,
	{ id },
	{ c },
) => {
	const user = await ensureRole(c);

	if (user.id !== id && user.role !== "admin") {
		throw new GraphQLError("You are not authorized to view this user");
	}

	const userData = await db.query.userTable.findFirst({
		where: (userTable, { eq }) => eq(userTable.id, id),
	});

	if (!userData) {
		throw new GraphQLError("User not found");
	}

	return {
		id: userData.id,
		role: (userData.role.toUpperCase() as "ADMIN" | "COMPETITOR") ?? undefined,
		teamId: userData.team ?? undefined,
		logn: userData.logn ?? undefined,
	};
};
