import { deleteSessionTokenCookie, invalidateSession } from "@/auth/session";
import type { MutationResolvers } from "./../../../types.generated";
export const logout: NonNullable<MutationResolvers["logout"]> = async (
	_parent,
	_arg,
	{ c, session, user },
) => {
	console.log(`User ${user.username} logged out`);
	await invalidateSession(session.id);
	deleteSessionTokenCookie(c);

	return true;
};
