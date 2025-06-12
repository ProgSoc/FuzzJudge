import type { QueryResolvers } from "./../../../types.generated";
export const me: NonNullable<QueryResolvers["me"]> = async (
	_parent,
	_arg,
	{ user },
) => {
	if (!user) return null;

	return {
		id: user.id,
		role: user.role,
		teamId: user.teamId,
		username: user.username,
	};
};
