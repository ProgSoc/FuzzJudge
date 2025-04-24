import { beforeAll, describe, expect, test } from "bun:test";

import {
	allTeams,
	assignUserTeam,
	createTeam,
	deleteTeam,
	getUserTeam,
	patchTeam,
} from "./team.service";
import { resetUser } from "./user.service";

import { migrateDB } from "../db";
import type { Team, User } from "../db/schema";

let testUser: User;
let team: Team;

beforeAll(async () => {
	await migrateDB();

	// Create a test user
	testUser = await resetUser({ logn: "test", role: "admin" });
});

describe("Team Service", () => {
	test("Create Team", async () => {
		team = await createTeam({ name: "Test Team" });
		expect(team).toBeDefined();
		expect(team.name).toBe("Test Team");
	});

	test("Get User Team", async () => {
		const userTeam = await getUserTeam(testUser.id);
		expect(userTeam).toBeUndefined();
	});

	test("Set User Team", async () => {
		const updatedUser = await assignUserTeam({
			user: testUser.id,
			team: team.id,
		});
		expect(updatedUser).toBeDefined();
		expect(updatedUser.team).toBe(team.id);
	});

	test("Patch Team", async () => {
		const updatedTeam = await patchTeam(team.id, { name: "Updated Test Team" });
		expect(updatedTeam).toBeDefined();
		expect(updatedTeam?.name).toBe("Updated Test Team");
	});

	test("All Teams", async () => {
		const teams = await allTeams();
		expect(teams.length).toBe(1);
		expect(teams[0].name).toBe("Updated Test Team");
	});

	test("Delete Team", async () => {
		await deleteTeam(team.id);
		const deletedTeam = await getUserTeam(testUser.id);
		expect(deletedTeam).toBeUndefined();
	});

	test("All Teams", async () => {
		const teams = await allTeams();
		expect(teams.length).toBe(0);
	});
});
