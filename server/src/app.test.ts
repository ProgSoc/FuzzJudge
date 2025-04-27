Bun.env.COMPETITION_PATH = "../sample";

import { describe, expect } from "bun:test";

import { testClient } from "hono/testing";
import app from "./app";

describe("indexHeader", async () => {
	const client = testClient(app);

	const res = await client.void.$get();

	expect(res.status).toBe(401);
});
