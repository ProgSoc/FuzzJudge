import { db } from "@/db";
import { GraphQLError } from "graphql";
import type { UserResolvers } from "./../../types.generated";
export const User: UserResolvers = {
	/* Implement User resolver logic here */
	team: async (user, _arg, { user: authedUser }) => {
		if (authedUser.id !== user.id && authedUser.role !== "admin") {
			throw new GraphQLError("You are not authorized to view this user's team");
		}

		const { teamId } = user;
		if (!teamId) {
			return null;
		}

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
			return null;
		}

		return team;
	},
};
