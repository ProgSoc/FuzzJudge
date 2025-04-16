import { eq } from "drizzle-orm";
import { db } from "impl/db";
import { userTable, type Team, type User, type UserRoles } from "impl/db/schema";

/**
 * Get a user by their id
 * @param id - The id of the user to get
 * @returns
 */
export async function getUser(id: number): Promise<User | undefined> {
  const user = await db.query.userTable.findFirst({
    where: (table) => eq(table.id, id),
  });

  return user;
}

/**
 * Get all users
 * @returns all users
 */
export async function allUsers(): Promise<User[]> {
  const users = await db.query.userTable.findMany();

  return users;
}

/**
 * Reset a user's login
 * @param params - The user login to reset and their role
 * @param resetPassword - Whether to reset the user's password
 * @returns the updated user
 */
export async function resetUser(params: { logn: string; role: UserRoles }, resetPassword = true): Promise<User> {
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

/**
 * Edit a user
 * @param id - The id of the user to edit
 * @param params - The user edit parameters
 * @returns The edited user
 */
export async function patchUser(id: number, params: Record<string, unknown>): Promise<User | undefined> {
  const [updatedUser] = await db.update(userTable).set(params).where(eq(userTable.id, id)).returning();

  if (!updatedUser) throw new Error("Failed to update user");

  return updatedUser;
}

/**
 * Delete a user
 * @param id - The id of the user to delete
 * @returns The deleted user
 */
export async function deleteUser(id: number) {
  const [deletedUser] = await db.delete(userTable).where(eq(userTable.id, id)).returning();

  if (!deletedUser) throw new Error("Failed to delete user");

  return deletedUser;
}

export async function assignUserTeam({ user = null as number | null, team = null as number | null }) {
    // db.query("UPDATE user SET team = :team WHERE id = :user", { team, user });

    if (user === null) return;

    db.update(userTable).set({ team }).where(eq(userTable.id, user)).returning();
  }