import { db } from "@/db";
import { userTable } from "@/db/schema";
import { ensureRole } from "@/middleware/graphQLAuthMiddleware";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const createUser: NonNullable<MutationResolvers["createUser"]> = async (
	_parent,
	{ role, teamId, logn },
	{ c },
) => {
	await ensureRole(c, ["admin"]);

	const [newUser] = await db
		.insert(userTable)
		.values({
			logn,
			role: role.toLowerCase() as "admin" | "competitor",
			team: teamId,
		})
		.returning();

	if (!newUser) {
		throw new GraphQLError("Failed to create user");
	}

	return {
		id: newUser.id,
		role: newUser.role,
		teamId: newUser.team ?? undefined,
		logn: newUser.logn ?? undefined,
	};
};
