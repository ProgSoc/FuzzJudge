import { db } from "@/db";
import { type User, type UserInsert, userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import { hashPassword } from "./password";

export async function createUser(params: UserInsert): Promise<User> {
	const { password } = params;
	const passwordHash = await hashPassword(password);

	const [row] = await db
		.insert(userTable)
		.values({ ...params, password: passwordHash })
		.returning();

	if (!row) {
		throw new GraphQLError("Unexpected error creating user");
	}

	return row;
}

async function updateUserPassword(
	userId: string,
	password: string,
): Promise<void> {
	const passwordHash = await hashPassword(password);

	await db
		.update(userTable)
		.set({ password: passwordHash })
		.where(eq(userTable.id, userId));
}

export const getUserFromUsername = async (
	username: string,
): Promise<User | null> => {
	const userRow = await db.query.userTable.findFirst({
		where: eq(userTable.username, username),
	});
	if (!userRow) {
		return null;
	}
	return userRow;
};

export async function getUserPasswordHash(userId: string): Promise<string> {
	const userRow = await db.query.userTable.findFirst({
		where: eq(userTable.id, userId),
		columns: {
			password: true,
		},
	});
	if (!userRow) {
		throw new Error("User not found");
	}
	return userRow.password;
}
