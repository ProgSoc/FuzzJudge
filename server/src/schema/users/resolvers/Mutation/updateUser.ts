import { db } from "@/db";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const updateUser: NonNullable<MutationResolvers["updateUser"]> = async (
	_parent,
	{ id, role, teamId, name },
) => {
	const [updatedUser] = await db
		.update(userTable)
		.set({
			role: role ?? undefined, // Allow role to be optional
			teamId,
			name: name ?? undefined, // Allow name to be optional
		})
		.where(eq(userTable.id, id))
		.returning();

	if (!updatedUser) {
		throw new GraphQLError("Failed to update user");
	}

	return {
		id: updatedUser.id,
		role: updatedUser.role,
		teamId: updatedUser.teamId,
		username: updatedUser.username,
		name: updatedUser.name,
	};
};
