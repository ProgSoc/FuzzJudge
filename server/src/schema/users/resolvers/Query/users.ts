import { db } from "@/db";
import type { QueryResolvers } from "./../../../types.generated";
export const users: NonNullable<QueryResolvers["users"]> = async (
	_parent,
	_arg,
	{ c },
) => {
	const users = await db.query.userTable.findMany();
	return users.map((user) => ({
		id: user.id,
		role: user.role,
		teamId: user.team ?? undefined,
		logn: user.logn ?? undefined,
	}));
};
