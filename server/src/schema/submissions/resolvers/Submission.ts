import { competitionRoot } from "@/config";
import { db } from "@/db";
import { getProblemData } from "@/services/problems.service";
import { GraphQLError } from "graphql";
import type { SubmissionResolvers } from "./../../types.generated";
export const Submission: SubmissionResolvers = {
	/* Implement Submission resolver logic here */
	team: async ({ teamId }, _arg, { user }) => {
		if (user.teamId !== teamId && user.role !== "admin") {
			throw new GraphQLError("You are not in this team");
		}

		const submissionTeam = await db.query.teamTable.findFirst({
			where: (teamTable, { eq }) => eq(teamTable.id, teamId),
			columns: {
				id: true,
				name: true,
				hidden: true, // Include hidden field if needed
				seed: true, // Include seed if needed
			},
		});

		if (!submissionTeam) {
			throw new GraphQLError("Team not found");
		}

		return submissionTeam;
	},
	problem: async ({ problemSlug }, _arg, _ctx) => {
		const problemData = await getProblemData(competitionRoot, problemSlug);

		return {
			difficulty: problemData.problem.difficulty,
			instructions: problemData.attributes.body,
			name: problemData.attributes.title,
			icon: problemData.attributes.icon ?? "",
			points: problemData.problem.points,
			slug: problemSlug,
		};
	},
};
