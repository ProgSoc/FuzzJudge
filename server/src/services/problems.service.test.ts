import { describe, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import {
	type Problem,
	fuzzProblem,
	getProblemData,
	getProblems,
	judgeProblem,
} from "./problems.service.ts";

const sampleRoot = fileURLToPath(import.meta.resolve("../../../sample"));
const problemSlug = "01-hello";

let testProblem: Problem;

describe("problem fuzzing and judging", () => {
	test("getProblemData", async () => {
		testProblem = await getProblemData(sampleRoot, problemSlug);
		expect(testProblem).toBeDefined();
	});

	test("getProblemData with invalid slug", () => {
		const problemDataPromise = getProblemData(sampleRoot, "invalid-slug");
		expect(problemDataPromise).rejects.toThrowError();
	});

	const seed = [...crypto.getRandomValues(new Uint8Array(8))]
		.map((v) => v.toString(16).padStart(2, "0"))
		.join("");

	test("fuzzProblem", async () => {
		const fuzzResult = await fuzzProblem(sampleRoot, problemSlug, seed);

		expect(fuzzResult).toBeDefined();
	});

	test("fuzzProblem with different seed", async () => {
		const fuzzResult1 = await fuzzProblem(sampleRoot, problemSlug, seed);
		const fuzzResult2 = await fuzzProblem(
			sampleRoot,
			problemSlug,
			"different-seed",
		);

		expect(fuzzResult1).not.toEqual(fuzzResult2);
	});

	test("fuzzProblem with invalid slug", () => {
		const fuzzResultPromise = fuzzProblem(sampleRoot, "invalid-slug", seed);
		expect(fuzzResultPromise).rejects.toThrowError();
	});

	test("fuzz problem with same seed", async () => {
		const fuzzResult1 = await fuzzProblem(sampleRoot, problemSlug, seed);
		const fuzzResult2 = await fuzzProblem(sampleRoot, problemSlug, seed);

		expect(fuzzResult1).toEqual(fuzzResult2);
	});

	test("judge fuzz", async () => {
		const fuzzResult = await fuzzProblem(sampleRoot, problemSlug, seed);
		expect(fuzzResult).toBeDefined();

		const lines = fuzzResult.split("\n");
		const noEndline = lines.filter((line) => line.length > 0);
		const answer = `${noEndline.map((line) => `Hello, ${line}!`).join("\n")}\n`;

		const judgeResult = await judgeProblem(
			sampleRoot,
			problemSlug,
			seed,
			answer,
		);

		expect(judgeResult).toEqual({
			correct: true,
		});
	});

	test("judge fuzz with wrong answer", async () => {
		const fuzzResult = await fuzzProblem(sampleRoot, problemSlug, seed);
		expect(fuzzResult).toBeDefined();

		const judgeResult = await judgeProblem(
			sampleRoot,
			problemSlug,
			seed,
			"wrong answer",
		);

		expect(judgeResult.correct).toEqual(false);
	});

	test("get list of problems", async () => {
		const problems = await getProblems(sampleRoot);
		expect(problems).toBeDefined();
		expect(problems.length).toBeGreaterThan(0);
	});
});
