import { competitionRoot } from "@/config";
import { fuzzProblem, getProblemData } from "@/services/problems.service";
import { solved } from "@/services/submission.service";
import { getUserTeam } from "@/services/team.service";
import type { QueryResolvers } from "./../../../types.generated";
export const problem: NonNullable<QueryResolvers["problem"]> = async (
	_parent,
	{ slug },
	{ c },
) => {
	const { user } = c.var;
	console.log("user", user);
	if (!user) {
		throw new Error("Unauthorized");
	}

	const team = await getUserTeam(user.id);

	if (!team) {
		throw new Error("You are not in a team");
	}

	const problemData = await getProblemData(competitionRoot, slug);
	const fuzz = await fuzzProblem(competitionRoot, slug, team.seed);

	const problemSolved = await solved({
		prob: slug,
		team: team.id,
	});

	return {
		brief: problemData.attributes.summary ?? "",
		difficulty: problemData.problem.difficulty,
		instructions: problemData.attributes.body,
		name: problemData.attributes.title,
		icon: problemData.attributes.icon,
		points: problemData.problem.points,
		slug,
		fuzz,
		solved: problemSolved,
	};
};
