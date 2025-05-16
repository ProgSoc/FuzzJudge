import { solved } from "@/services/submission.service";
import { GraphQLError } from "graphql";
import type { ProblemResolvers } from "./../../types.generated";
export const Problem: ProblemResolvers = {
	solved: async ({ slug }, _arg, { c }) => {
		const { user } = c.var;
		if (!user) {
			throw new GraphQLError("Unauthorized");
		}
		const { team: teamId } = user;
		if (!teamId) {
			throw new GraphQLError("You are not in a team");
		}

		const problemSolved = await solved({
			prob: slug,
			team: teamId,
		});

		return problemSolved;
	},
};
