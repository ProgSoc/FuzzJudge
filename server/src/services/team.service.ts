import { eq } from "drizzle-orm";
import { db } from "../db";
import { type Team, teamTable, userTable } from "../db/schema";

/**
 * Get a user's team by their id
 * @param id - The id of the user whose team to get
 * @returns the team of the user
 */
export async function getUserTeam(id: number): Promise<Team | undefined> {
	const user = await db.query.userTable.findFirst({
		where: (table) => eq(table.id, id),
	});
	const teamId = user?.team;
	if (!teamId) return undefined;
	const team = await db.query.teamTable.findFirst({
		where: (table) => eq(table.id, teamId),
	});
	return team;
}

/**
 * Create a new team
 * @param param0 - The team creation parameters
 * @returns The created team
 */
export async function createTeam({ name }: { name: string }): Promise<Team> {
	const seed = [...crypto.getRandomValues(new Uint8Array(8))]
		.map((v) => v.toString(16).padStart(2, "0"))
		.join("");

	const [team] = await db
		.insert(teamTable)
		.values({ seed, name })
		.returning()
		.onConflictDoNothing();

	if (!team) throw new Error("Failed to create team");

	return team;
}

/**
 * Edit a team
 * @param id The id of the team to edit
 * @param param1 The team edit parameters
 * @returns The edited team
 */
export async function patchTeam(
	id: number,
	{ name }: { name: string },
): Promise<Team> {
	const [team] = await db
		.update(teamTable)
		.set({ name })
		.where(eq(teamTable.id, id))
		.returning();

	if (!team) throw new Error("Failed to update team");

	return team;
}

export async function deleteTeam(id: number) {
	await db.delete(teamTable).where(eq(teamTable.id, id));
}

export async function allTeams(): Promise<Team[]> {
	return db.query.teamTable.findMany();
}

export async function assignUserTeam({
	user = null as number | null,
	team = null as number | null,
}) {
	// db.query("UPDATE user SET team = :team WHERE id = :user", { team, user });

	if (user === null) throw new Error("User ID is required");

	const [updatedUser] = await db
		.update(userTable)
		.set({ team })
		.where(eq(userTable.id, user))
		.returning();

	if (!updatedUser) throw new Error("Failed to update user");

	return updatedUser;
}
