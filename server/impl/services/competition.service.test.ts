import { fileURLToPath } from "bun";
import { describe, expect, test } from "bun:test";  
import { getCompetitionData } from "./competition.service";
import path from "path";

const sampleRoot = fileURLToPath(import.meta.resolve("../../../sample"));

describe("competition data reading", () => {
    test("getCompetitionData", async () => {
        const competitionData = await getCompetitionData(sampleRoot);
        expect(competitionData).toBeDefined();
    })

    test("getCompetitionData with invalid file", async () => {
        const filePath = path.join(sampleRoot, "invalid");
        const competitionData = getCompetitionData(filePath );    
        expect(competitionData).rejects.toThrow()
    })
})