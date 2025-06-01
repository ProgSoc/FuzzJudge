import { db } from "@/db";
import { GraphQLError } from "graphql";
import type { ScoreboardRowResolvers } from "./../../types.generated";
export const ScoreboardRow: ScoreboardRowResolvers = {
	/* Implement ScoreboardRow resolver logic here */
	team: async ({ teamId }, _arg, _ctx) => {
		const team = await db.query.teamTable.findFirst({
			where: (teamTable, { eq }) => eq(teamTable.id, teamId),
			columns: {
				id: true,
				name: true,
				hidden: true, // Include hidden field if needed
				seed: true, // Include seed if needed
			},
		});

		if (!team) {
			throw new GraphQLError(`Team with id ${teamId} not found`);
		}

		return team;
	},
};
