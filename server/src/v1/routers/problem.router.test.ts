import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { init } from "@bokuweb/zstd-wasm";
import { testClient } from "hono/testing";
import { migrateDB } from "../../db";
import type { Team, User } from "../../db/schema.ts";
import { basicAuth } from "../../services/auth.service";
import {
	assignUserTeam,
	createTeam,
	deleteTeam,
} from "../../services/team.service";
import { deleteUser, resetUser } from "../../services/user.service";
import { probRouter } from "./problem.router.ts";

let adminBasicAuthHeader = "";
let adminUser: User;
let competitorUser: User;
let competitorBasicAuthHeader = "";
let team: Team;
let fuzzInput: string;

beforeAll(async () => {
	migrateDB();
	init();
	// Create a test user
	adminUser = await resetUser({
		logn: "test-admin",
		role: "admin",
	});

	const adminPassword = "test-admin-password";
	await basicAuth(adminUser.logn, adminPassword); // Sets the password (first login)

	competitorUser = await resetUser({
		logn: "test-competition",
		role: "competitor",
	});

	team = await createTeam({
		name: "test-team",
	});

	const competitionPassword = "test-competitor-password";
	await basicAuth(competitorUser.logn, competitionPassword); // Sets the password (first login)
	assignUserTeam({
		user: competitorUser.id,
		team: team.id,
	});

	adminBasicAuthHeader = btoa(`${adminUser.logn}:${adminPassword}`);
	competitorBasicAuthHeader = btoa(
		`${competitorUser.logn}:${competitionPassword}`,
	);
});

afterAll(async () => {
	// Delete the test user
	await deleteUser(adminUser.id);
	await deleteUser(competitorUser.id);
	// Delete the test team
	await deleteTeam(team.id);
});

describe("Problem Tests", async () => {
	const client = testClient(probRouter);

	it("GET /comp/prob", async () => {
		const res = await client.index.$get({});
		expect(res.status).toBe(200);
		// expect(res.headers.get("")).toBe("text/csv");
		const text = await res.text();
		expect(text).toContain("01-hello");
	});

	// Name
	describe("GET /comp/prob/01-hello/name", () => {
		it("200 /comp/prob/01-hello/name", async () => {
			const res = await client[":id"].name.$get({ param: { id: "01-hello" } });
			expect(res.status).toBe(200);
			const text = await res.text();
			expect(text).toContain("Hello Programmers");
		});

		it("404 /comp/prob/01-hello/name", async () => {
			const res = await client[":id"].name.$get({ param: { id: "01-hello2" } });
			expect(res.status).toBe(404);
			const text = await res.text();
			expect(text).toContain("404 Not Found");
		});
	});

	// Icon
	describe("GET /comp/prob/01-hello/icon", () => {
		it("200 /comp/prob/01-hello/icon", async () => {
			const res = await client[":id"].icon.$get({ param: { id: "01-hello" } });
			expect(res.status).toBe(200);
		});

		it("404 /comp/prob/01-hello/icon", async () => {
			const res = await client[":id"].icon.$get({ param: { id: "01-hello2" } });
			expect(res.status).toBe(404);
			const text = await res.text();
			expect(text).toContain("404 Not Found");
		});
	});

	// Brief
	describe("GET /comp/prob/01-hello/brief", () => {
		it("200 /comp/prob/01-hello/brief", async () => {
			const res = await client[":id"].brief.$get({ param: { id: "01-hello" } });
			expect(res.status).toBe(200);
		});

		it("404 /comp/prob/01-hello/brief", async () => {
			const res = await client[":id"].brief.$get({
				param: { id: "01-hello2" },
			});
			expect(res.status).toBe(404);
			const text = await res.text();
			expect(text).toContain("404 Not Found");
		});
	});

	// difficulty
	describe("GET /comp/prob/01-hello/difficulty", () => {
		it("200 /comp/prob/01-hello/difficulty", async () => {
			const res = await client[":id"].difficulty.$get({
				param: { id: "01-hello" },
			});
			expect(res.status).toBe(200);
		});

		it("404 /comp/prob/01-hello/difficulty", async () => {
			const res = await client[":id"].difficulty.$get({
				param: { id: "01-hello2" },
			});
			expect(res.status).toBe(404);
			const text = await res.text();
			expect(text).toContain("404 Not Found");
		});
	});

	// Points
	describe("GET /comp/prob/01-hello/points", () => {
		it("200 /comp/prob/01-hello/points", async () => {
			const res = await client[":id"].points.$get({
				param: { id: "01-hello" },
			});
			const text = await res.text();
			expect(text).toContain("20");
			expect(res.status).toBe(200);
		});

		it("404 /comp/prob/01-hello/points", async () => {
			const res = await client[":id"].points.$get({
				param: { id: "01-hello2" },
			});
			expect(res.status).toBe(404);
			const text = await res.text();
			expect(text).toContain("404 Not Found");
		});
	});

	// Solution
	describe("GET /comp/prob/01-hello/solution", () => {
		it("200 /comp/prob/01-hello/solution", async () => {
			const res = await client[":id"].solution.$get({
				param: { id: "01-hello" },
			});
			expect(res.status).toBe(451);
		});
	});

	// Instructions (Authenticated)
	describe("GET /comp/prob/01-hello/instructions", () => {
		it("401 /comp/prob/01-hello/instructions", async () => {
			const res = await client[":id"].instructions.$get({
				param: { id: "01-hello" },
			});
			expect(res.status).toBe(401);
			const text = await res.text();
			expect(text).toContain("401 Unauthorized");
		});

		it("200 /comp/prob/01-hello/instructions", async () => {
			const res = await client[":id"].instructions.$get(
				{
					param: { id: "01-hello" },
				},
				{
					headers: {
						Authorization: `Basic ${adminBasicAuthHeader}`,
					},
				},
			);
			expect(res.status).toBe(200);
		});
	});

	// Fuzz input (Authenticated)
	describe("GET /comp/prob/01-hello/fuzz", () => {
		it("401 /comp/prob/01-hello/fuzz", async () => {
			const res = await client[":id"].fuzz.$get({
				param: { id: "01-hello" },
			});
			expect(res.status).toBe(401);
			const text = await res.text();
			expect(text).toContain("401 Unauthorized");
		});

		// Competitor In Team
		it("200 /comp/prob/01-hello/fuzz", async () => {
			const res = await client[":id"].fuzz.$get(
				{
					param: { id: "01-hello" },
				},
				{
					headers: {
						Authorization: `Basic ${competitorBasicAuthHeader}`,
					},
				},
			);
			expect(res.status).toBe(200);
			fuzzInput = await res.text();
			expect(fuzzInput).toBeDefined();
		});

		// User Not In Team
		it("403 /comp/prob/01-hello/fuzz", async () => {
			const res = await client[":id"].fuzz.$get(
				{
					param: { id: "01-hello" },
				},
				{
					headers: {
						Authorization: `Basic ${adminBasicAuthHeader}`,
					},
				},
			);
			expect(res.status).toBe(403);
			const text = await res.text();
			expect(text).toContain("403 Forbidden");
		});
	});

	// Test Judgement Status (Authenticated)
	describe("GET /comp/prob/01-hello/judge", () => {
		it("401 /comp/prob/01-hello/jude", async () => {
			const res = await client[":id"].judge.$get({
				param: { id: "01-hello" },
			});
			expect(res.status).toBe(401);
			const text = await res.text();
			expect(text).toContain("401 Unauthorized");
		});

		// Competitor Not In Team
		it("403 /comp/prob/01-hello/judge", async () => {
			const res = await client[":id"].judge.$get(
				{
					param: { id: "01-hello" },
				},
				{
					headers: {
						Authorization: `Basic ${adminBasicAuthHeader}`,
					},
				},
			);
			expect(res.status).toBe(403);
			const text = await res.text();
			expect(text).toContain("403 Forbidden");
		});

		it("200 /comp/prob/01-hello/judge", async () => {
			const res = await client[":id"].judge.$get(
				{
					param: { id: "01-hello" },
				},
				{
					headers: {
						Authorization: `Basic ${competitorBasicAuthHeader}`,
					},
				},
			);
			expect(res.status).toBe(200);
			const text = await res.text();
			// Not solved
			expect(text).toContain("Not Solved");
		});
	});

	// Test Judgement (Authenticated)
	describe("POST /comp/prob/01-hello/judge", () => {
		const incorrectSolution = "incorrect-solution";

		it("401 /comp/prob/01-hello/judge", async () => {
			const res = await client[":id"].judge.$post({
				param: { id: "01-hello" },
				form: {
					output: incorrectSolution,
					source: "any",
				},
			});
			expect(res.status).toBe(401);
			const text = await res.text();
			expect(text).toContain("401 Unauthorized");
		});

		// Competitor Not In Team
		it("403 /comp/prob/01-hello/judge", async () => {
			const res = await client[":id"].judge.$post(
				{
					param: { id: "01-hello" },
					form: {
						output: incorrectSolution,
						source: "any",
					},
				},
				{
					headers: {
						Authorization: `Basic ${adminBasicAuthHeader}`,
					},
				},
			);
			expect(res.status).toBe(403);
			const text = await res.text();
			expect(text).toContain("403 Forbidden");
		});

		it("422 /comp/prob/01-hello/judge", async () => {
			const res = await client[":id"].judge.$post(
				{
					param: { id: "01-hello" },
					form: {
						output: incorrectSolution,
						source: "any",
					},
				},
				{
					headers: {
						Authorization: `Basic ${competitorBasicAuthHeader}`,
					},
				},
			);
			expect(res.status).toBe(422); // Unprocessable Entity (Solution not correct)
			const text = await res.text();
			expect(text).toContain("Solution rejected");
		});

		// Solved correctly
		it("200 /comp/prob/01-hello/judge", async () => {
			const lines = fuzzInput.split("\n");
			const noEndline = lines.filter((line) => line.length > 0);
			const answer = `${noEndline.map((line) => `Hello, ${line}!`).join("\n")}\n`;

			const res = await client[":id"].judge.$post(
				{
					param: { id: "01-hello" },
					form: {
						output: answer,
						source: "any",
					},
				},
				{
					headers: {
						Authorization: `Basic ${competitorBasicAuthHeader}`,
					},
				},
			);
			expect(res.status).toBe(200);
			const text = await res.text();
			expect(text).toContain("Approved");
		});

		// Solve again
		it("422 /comp/prob/01-hello/judge", async () => {
			const res = await client[":id"].judge.$post(
				{
					param: { id: "01-hello" },
					form: {
						output: incorrectSolution,
						source: "any",
					},
				},
				{
					headers: {
						Authorization: `Basic ${competitorBasicAuthHeader}`,
					},
				},
			);
			expect(res.status).toBe(409); // Already solved
			const text = await res.text();
			expect(text).toContain("Problem already solved");
		});
	});

	// Problem Assets
	describe("GET /comp/prob/01-hello/assets", () => {
		it("200 /comp/prob/01-hello/assets", async () => {
			const { pathname } = client[":id"].assets["*"].$url({
				param: { id: "01-hello" },
			});

			const res = await probRouter.fetch(
				new Request(
					`http://localhost${pathname.replace("*", "examples.txt")}`,
					{
						headers: {
							Authorization: `Basic ${adminBasicAuthHeader}`,
						},
					},
				),
			);

			expect(res.status).toBe(200);
		});

		it("404 /comp/prob/01-hello/assets", async () => {
			const { pathname } = client[":id"].assets["*"].$url({
				param: { id: "01-hello" },
			});

			const res = await probRouter.fetch(
				new Request(
					`http://localhost${pathname.replace("*", "not-found.txt")}`,
					{
						headers: {
							Authorization: `Basic ${adminBasicAuthHeader}`,
						},
					},
				),
			);

			expect(res.status).toBe(404);
			const text = await res.text();
			expect(text).toContain("404 Not Found");
		});

		it("401 /comp/prob/01-hello/assets", async () => {
			const { pathname } = client[":id"].assets["*"].$url({
				param: { id: "01-hello" },
			});

			const res = await probRouter.fetch(
				new Request(`http://localhost${pathname}`),
			);

			expect(res.status).toBe(401);
			const text = await res.text();
			expect(text).toContain("401 Unauthorized");
		});
	});
});
