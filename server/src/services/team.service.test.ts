import { beforeAll, describe, expect, test } from "bun:test";

import { allTeams } from "./team.service";
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
	test("All Teams", async () => {
		const teams = await allTeams();
		expect(teams.length).toBe(1);
		expect(teams[0].name).toBe("Updated Test Team");
	});

	test("All Teams", async () => {
		const teams = await allTeams();
		expect(teams.length).toBe(0);
	});
});
