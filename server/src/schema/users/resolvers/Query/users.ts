import { db } from "@/db";
import type { QueryResolvers } from "./../../../types.generated";
export const users: NonNullable<QueryResolvers["users"]> = async (
	_parent,
	_arg,
) => {
	const users = await db.query.userTable.findMany();
	return users.map((user) => ({
		id: user.id,
		role: user.role,
		teamId: user.teamId,
		username: user.username,
		name: user.name,
	}));
};
