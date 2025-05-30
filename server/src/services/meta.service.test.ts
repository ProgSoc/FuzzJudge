import { describe, expect, test } from "bun:test";

import { getOrSetDefaultMeta } from "./meta.service";

describe("Meta Service", () => {
	test("getOrSetDefaultMeta", async () => {
		const key = "testKey";
		const defaultValue = "defaultValue";

		// First call should set the default value
		const result1 = await getOrSetDefaultMeta(key, defaultValue);
		expect(result1).toBe(defaultValue);

		// Second call should return the existing value
		const result2 = await getOrSetDefaultMeta(key);
		expect(result2).toBe(defaultValue);
	});
});
