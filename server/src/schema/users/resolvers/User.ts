import { db } from "@/db";
import { ensureRole } from "@/middleware/graphQLAuthMiddleware";
import { GraphQLError } from "graphql";
import type { UserResolvers } from "./../../types.generated";
export const User: UserResolvers = {
	/* Implement User resolver logic here */
	team: async (user, _arg, { c }) => {
		const currentUser = await ensureRole(c);

		if (currentUser.id !== user.id && currentUser.role !== "admin") {
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
			},
		});

		if (!team) {
			return null;
		}

		return team;
	},
	role: ({ role }, _arg, _ctx) => {
		/* User.role resolver is required because User.role and UserMapper.role are not compatible */
		return role;
	},
};
