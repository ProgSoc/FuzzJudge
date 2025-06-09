import type { QueryResolvers } from "./../../../types.generated";
export const me: NonNullable<QueryResolvers["me"]> = async (
	_parent,
	_arg,
	{ c },
) => {
	const user = c.get("user");

	if (!user) return null;

	return {
		id: user.id,
		role: user.role,
		teamId: user.team ?? undefined,
		logn: user.logn ?? undefined,
	};
};
