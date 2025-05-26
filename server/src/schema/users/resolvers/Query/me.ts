import { ensureRole } from "@/middleware/graphQLAuthMiddleware";
import type { QueryResolvers } from "./../../../types.generated";
export const me: NonNullable<QueryResolvers["me"]> = async (
	_parent,
	_arg,
	{ c },
) => {
	const user = await ensureRole(c);

	return {
		id: user.id,
		role: (user.role.toUpperCase() as "ADMIN" | "COMPETITOR") ?? undefined,
		teamId: user.team ?? undefined,
		logn: user.logn ?? undefined,
	};
};
