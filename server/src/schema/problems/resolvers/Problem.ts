import { competitionRoot } from "@/config";
import { db } from "@/db";
import { fuzzProblem } from "@/services/problems.service";
import { solved } from "@/services/submission.service";
import { GraphQLError } from "graphql";
import type { ProblemResolvers } from "./../../types.generated";
export const Problem: ProblemResolvers = {
	solved: async ({ slug }, _arg, { user }) => {
		if (!user) return null;
		const { teamId } = user;
		if (!teamId) {
			return null;
		}

		const problemSolved = await solved({
			prob: slug,
			team: teamId,
		});

		return problemSolved;
	},
	fuzz: async ({ slug }, { teamId: argTeamId }, { user }) => {
		const teamId = argTeamId ?? user.teamId;
		if (!teamId) {
			throw new GraphQLError("You are not in a team");
		}
		const team = await db.query.teamTable.findFirst({
			where: (teamTable, { eq }) => eq(teamTable.id, teamId),
		});

		if (!team) {
			throw new GraphQLError("You are not in a team");
		}

		const fuzz = await fuzzProblem(competitionRoot, slug, team.seed);

		return fuzz;
	},
};
