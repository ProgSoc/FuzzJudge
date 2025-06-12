import { db } from "@/db";
import { userTable } from "@/db/schema";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const createUser: NonNullable<MutationResolvers["createUser"]> = async (
	_parent,
	{ role, teamId, username, password },
) => {
	const [newUser] = await db
		.insert(userTable)
		.values({
			username,
			password,
			role,
			teamId,
		})
		.returning();

	if (!newUser) {
		throw new GraphQLError("Failed to create user");
	}

	return {
		id: newUser.id,
		role: newUser.role,
		teamId: newUser.teamId,
		username: newUser.username,
	};
};
