import { competitionRoot } from "@/config";
import { getProblemData } from "@/services/problems.service";
import type { ProblemScoreResolvers } from "./../../types.generated";
export const ProblemScore: ProblemScoreResolvers = {
	/* Implement ProblemScore resolver logic here */
	problem: async ({ slug }, _arg, _ctx) => {
		const problemData = await getProblemData(competitionRoot, slug);

		return {
			brief: problemData.attributes.summary ?? "",
			difficulty: problemData.problem.difficulty,
			instructions: problemData.attributes.body,
			name: problemData.attributes.title,
			icon: problemData.attributes.icon ?? "",
			points: problemData.problem.points,
			slug,
		};
	},
};
