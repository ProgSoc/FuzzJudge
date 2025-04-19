import { describe, expect, test } from "bun:test";
import { getProblemData, fuzzProblem, judgeProblem } from "./problems.service.ts";
import { fileURLToPath } from "node:url";

const sampleRoot = fileURLToPath(import.meta.resolve("../../../sample"));
const problemSlug = "01-hello";

describe("problem fuzzing and judging", () => {
    test("getProblemData", async () => {
        const problemData = await getProblemData(sampleRoot, problemSlug);
        expect(problemData).toBeDefined();
      });
      
      test("getProblemData with invalid slug", () => {
        const problemDataPromise = getProblemData(sampleRoot, "invalid-slug");
        expect(problemDataPromise).rejects.toThrowError();
      });
      
      const seed = [...crypto.getRandomValues(new Uint8Array(8))].map((v) => v.toString(16).padStart(2, "0")).join("");
      
      test("fuzzProblem", async () => {
        const fuzzResult = await fuzzProblem(sampleRoot, problemSlug, seed);
      
        expect(fuzzResult).toBeDefined();
      });
      
      test("fuzzProblem with different seed", async () => {
        const fuzzResult1 = await fuzzProblem(sampleRoot, problemSlug, seed);
        const fuzzResult2 = await fuzzProblem(sampleRoot, problemSlug, "different-seed");
      
        expect(fuzzResult1).not.toEqual(fuzzResult2);
      });
      
      test("judge fuzz", async () => {
        const fuzzResult = await fuzzProblem(sampleRoot, problemSlug, seed);
        expect(fuzzResult).toBeDefined();
      
        const lines = fuzzResult.split("\n");
        const noEndline = lines.filter((line) => line.length > 0);
        const answer = noEndline.map((line) => `Hello, ${line}!`).join("\n") + "\n";
      
        const judgeResult = await judgeProblem(sampleRoot, problemSlug, seed, answer);
      
        expect(judgeResult).toEqual({
          correct: true,
        });
      });
      
      test("judge fuzz with wrong answer", async () => {
        const fuzzResult = await fuzzProblem(sampleRoot, problemSlug, seed);
        expect(fuzzResult).toBeDefined();
      
        const judgeResult = await judgeProblem(sampleRoot, problemSlug, seed, "wrong answer");
      
        expect(judgeResult.correct).toEqual(false);
      });
      
})

