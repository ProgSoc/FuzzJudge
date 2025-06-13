import { db } from "@/db";
import { GraphQLError } from "graphql";
import type { QueryResolvers } from "./../../../types.generated";
export const user: NonNullable<QueryResolvers["user"]> = async (
	_parent,
	{ id },
	{ user: authedUser },
) => {
	if (authedUser.id !== id && authedUser.role !== "admin") {
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
		role: userData.role,
		teamId: userData.teamId,
		username: userData.username,
		name: userData.name,
	};
};
