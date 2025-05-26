import { db } from "@/db";
import { ensureRole } from "@/middleware/graphQLAuthMiddleware";
import type { QueryResolvers } from "./../../../types.generated";
export const users: NonNullable<QueryResolvers["users"]> = async (
	_parent,
	_arg,
	{ c },
) => {
	await ensureRole(c, ["admin"]);
	const users = await db.query.userTable.findMany();
	return users.map((user) => ({
		id: user.id,
		role: (user.role.toUpperCase() as "ADMIN" | "COMPETITOR") ?? undefined,
		teamId: user.team ?? undefined,
		logn: user.logn ?? undefined,
	}));
};
