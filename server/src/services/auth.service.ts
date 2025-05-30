import { count, eq } from "drizzle-orm";
import { db } from "../db";
import { type User, userTable } from "../db/schema";

export async function basicAuth(
	logn: string,
	password: string,
): Promise<User | null> {
	const hash = await Bun.password.hash(password);

	// Check if the user exists in the database.
	const user = await db.query.userTable.findFirst({
		where: (table) => eq(table.logn, logn),
	});

	// If no user is found, return null.
	if (!user) {
		// get user count
		const [userCountData] = await db
			.select({
				userCount: count(),
			})
			.from(userTable);

		if (userCountData?.userCount === 0) {
			// If no user exists, create a new user with the provided login and hashed password.
			const [newUser] = await db
				.insert(userTable)
				.values({ logn, password: hash, role: "admin" })
				.returning();

			if (!newUser) return null;

			return newUser;
		}

		return null;
	}

	// Password reset mode, overwrite with new password.
	if (user.password === null) {
		const [newUser] = await db
			.update(userTable)
			.set({ password: hash })
			.where(eq(userTable.id, user.id))
			.returning();

		if (!newUser) return null;

		return newUser;
	}

	// Verify the password against the stored hash.
	const isValid = await Bun.password.verify(password, user.password);

	// If the password is valid, return the user object.
	return isValid ? user : null;
}
