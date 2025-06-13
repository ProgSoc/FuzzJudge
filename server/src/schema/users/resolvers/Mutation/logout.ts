import { deleteSessionTokenCookie, invalidateSession } from "@/auth/session";
import type { MutationResolvers } from "./../../../types.generated";
export const logout: NonNullable<MutationResolvers["logout"]> = async (
	_parent,
	_arg,
	{ c, session },
) => {
	await invalidateSession(session.id);
	deleteSessionTokenCookie(c);

	return true;
};
