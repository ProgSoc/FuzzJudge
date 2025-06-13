import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
} from "@/auth/session";
import { createUser, getUserFromUsername } from "@/auth/user";
import { db } from "@/db";
import { userTable } from "@/db/schema";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const register: NonNullable<MutationResolvers["register"]> = async (
	_parent,
	{ username, password, name },
	{ c },
) => {
	const currentUser = await getUserFromUsername(username);

	if (currentUser) {
		throw new GraphQLError("Username is already taken");
	}

	// get user count
	const count = await db.$count(userTable);
	let role: "competitor" | "admin" = "competitor";
	if (count === 0) {
		// If this is the first user, make them an admin
		role = "admin";
	}

	const user = await createUser({
		name,
		username,
		password,
		role,
	});

	const sessionToken = generateSessionToken();

	const session = await createSession(sessionToken, user.id);

	setSessionTokenCookie(c, sessionToken, session.expiresAt);

	return user;
};
