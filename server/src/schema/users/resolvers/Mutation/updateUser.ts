import { db } from "@/db";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
import { hashPassword } from "@/auth/password";
export const updateUser: NonNullable<MutationResolvers["updateUser"]> = async (
	_parent,
	{ id, role, teamId, name, username, password },
) => {
	const hashedPassword = password ? await hashPassword(password) : undefined;
	const [updatedUser] = await db
		.update(userTable)
		.set({
			role: role ?? undefined, // Allow role to be optional
			teamId,
			username: username ?? undefined, // Allow username to be optional
			name: name ?? undefined, // Allow name to be optional
			password: hashedPassword, // Hash password if provided
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
