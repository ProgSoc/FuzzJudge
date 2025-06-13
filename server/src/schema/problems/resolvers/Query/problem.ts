import { competitionRoot } from "@/config";
import { getProblemData } from "@/services/problems.service";
import type { QueryResolvers } from "./../../../types.generated";
export const problem: NonNullable<QueryResolvers["problem"]> = async (
	_parent,
	{ slug },
) => {
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
};
