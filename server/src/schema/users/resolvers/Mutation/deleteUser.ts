import { db } from "@/db";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const deleteUser: NonNullable<MutationResolvers["deleteUser"]> = async (
	_parent,
	{ id },
) => {
	const [deletedUser] = await db
		.delete(userTable)
		.where(eq(userTable.id, id))
		.returning();

	if (!deletedUser) {
		throw new GraphQLError("Failed to delete user");
	}

	return {
		id: deletedUser.id,
		role: deletedUser.role,
		teamId: deletedUser.teamId,
		username: deletedUser.username,
		name: deletedUser.name,
	};
};
