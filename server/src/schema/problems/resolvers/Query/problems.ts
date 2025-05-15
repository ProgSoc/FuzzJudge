import { competitionRoot } from "@/config";
import { getProblems } from "@/services/problems.service";
import type { QueryResolvers } from "./../../../types.generated";
export const problems: NonNullable<QueryResolvers["problems"]> = async (
	_parent,
	_arg,
	_ctx,
) => {
	const problems = await getProblems(competitionRoot);

	return problems.map((problemData) => ({
		brief: problemData.attributes.summary ?? "",
		difficulty: problemData.problem.difficulty,
		instructions: problemData.attributes.body,
		name: problemData.attributes.title,
		icon: problemData.attributes.icon,
		points: problemData.problem.points,
		slug: problemData.slug,
	}));
};
