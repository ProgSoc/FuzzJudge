import { db } from "../db";
import { type User, type UserRoles, userTable } from "../db/schema";

/**
 * Reset a user's login
 * @param params - The user login to reset and their role
 * @param resetPassword - Whether to reset the user's password
 * @returns the updated user
 */
export async function resetUser(
	params: { logn: string; role: UserRoles },
	resetPassword = true,
): Promise<User> {
	const [updatedUser] = await db
		.insert(userTable)
		.values({
			logn: params.logn,
			salt: Buffer.from(crypto.getRandomValues(new Uint8Array(32)).buffer),
			role: params.role,
		})
		.onConflictDoUpdate({
			set: {
				role: params.role,
				...(resetPassword ? { hash: null } : {}),
			},
			target: [userTable.logn],
		})
		.returning();

	if (!updatedUser) throw new Error("Failed to reset user");

	return updatedUser;
}
