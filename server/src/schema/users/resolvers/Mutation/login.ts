import { verifyPasswordHash } from "@/auth/password";
import {
	createSession,
	generateSessionToken,
	invalidateUserSessions,
	setSessionTokenCookie,
} from "@/auth/session";
import { getUserFromUsername, getUserPasswordHash } from "@/auth/user";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const login: NonNullable<MutationResolvers["login"]> = async (
	_parent,
	{ username, password },
	{ c },
) => {
	// get the user by username
	const user = await getUserFromUsername(username);
	if (user === null) {
		throw new GraphQLError("Invalid username or password");
	}
	const passwordHash = await getUserPasswordHash(user.id);
	const validPassword = await verifyPasswordHash(passwordHash, password);
	if (!validPassword) {
		throw new GraphQLError("Invalid username or password");
	}

	const sessionToken = generateSessionToken();

	// invalidate the old session if it exists
	await invalidateUserSessions(user.id);

	const session = await createSession(sessionToken, user.id);

	setSessionTokenCookie(c, sessionToken, session.expiresAt);

	return user;
};
