import { describe, expect, test } from "bun:test";

import { migrateDB } from "../db";
import {
	allMeta,
	deleteAllMeta,
	deleteMeta,
	getOrSetDefaultMeta,
	setMeta,
} from "./meta.service";

await migrateDB();

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

	test("setMeta", async () => {
		const key = "testKey";
		const value = "newValue";

		// Set the meta value
		await setMeta(key, value);

		// Verify that the value was set correctly
		const result = await allMeta();
		expect(result[key]).toBe(value);
	});

	test("allMeta", async () => {
		const key1 = "key1";
		const value1 = "value1";
		const key2 = "key2";
		const value2 = "value2";

		// Set multiple meta values
		await setMeta(key1, value1);
		await setMeta(key2, value2);

		// Get all meta values
		const result = await allMeta();

		expect(result[key1]).toBe(value1);
		expect(result[key2]).toBe(value2);
	});

	test("deleteMeta", async () => {
		const key = "testKey";
		const value = "testValue";

		// Set the meta value
		await setMeta(key, value);

		// Verify that the value was set correctly
		const resultBeforeDelete = await allMeta();
		expect(resultBeforeDelete[key]).toBe(value);

		// Delete the meta value
		await deleteMeta(key);

		// Verify that the value was deleted
		const resultAfterDelete = await allMeta();
		expect(resultAfterDelete[key]).toBeUndefined();
	});

	test("delete allMeta", async () => {
		const key1 = "key1";
		const value1 = "value1";
		const key2 = "key2";
		const value2 = "value2";

		// Set multiple meta values
		await setMeta(key1, value1);
		await setMeta(key2, value2);

		// Delete all meta values
		await deleteAllMeta();

		// Get all meta values
		const result = await allMeta();

		expect(result[key1]).toBeUndefined();
		expect(result[key2]).toBeUndefined();
	});
});
