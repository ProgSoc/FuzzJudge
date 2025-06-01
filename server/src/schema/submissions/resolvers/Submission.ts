import { db } from "@/db";
import { GraphQLError } from "graphql";
import type { SubmissionResolvers } from "./../../types.generated";
export const Submission: SubmissionResolvers = {
	/* Implement Submission resolver logic here */
	team: async ({ teamId }, _arg, { c, user }) => {
		if (user.team !== teamId && user.role !== "admin") {
			throw new GraphQLError("You are not in this team");
		}

		const submissionTeam = await db.query.teamTable.findFirst({
			where: (teamTable, { eq }) => eq(teamTable.id, teamId),
			columns: {
				id: true,
				name: true,
			},
		});

		if (!submissionTeam) {
			throw new GraphQLError("Team not found");
		}

		return submissionTeam;
	},
};
