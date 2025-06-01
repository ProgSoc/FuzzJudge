import { db } from "@/db";
import { userTable } from "@/db/schema";
import { ensureRole } from "@/middleware/graphQLAuthMiddleware";
import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const updateUser: NonNullable<MutationResolvers["updateUser"]> = async (
	_parent,
	{ id, role, teamId },
	{ c },
) => {
	await ensureRole(c, ["admin"]);

	const [updatedUser] = await db
		.update(userTable)
		.set({
			role: role?.toLowerCase() as "admin" | "competitor" | undefined,
			team: teamId,
		})
		.where(eq(userTable.id, id))
		.returning();

	if (!updatedUser) {
		throw new GraphQLError("Failed to update user");
	}

	return {
		id: updatedUser.id,
		role: updatedUser.role,
		teamId: updatedUser.team ?? undefined,
		logn: updatedUser.logn ?? undefined,
	};
};
