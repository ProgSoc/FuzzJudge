import { db } from "@/db";
import { GraphQLError } from "graphql";
import type { QueryResolvers } from "./../../../types.generated";
export const team: NonNullable<QueryResolvers["team"]> = async (
	_parent,
	{ id },
	{ c },
) => {
	const rawTeam = await db.query.teamTable.findFirst({
		where: (teamTable, { eq }) => eq(teamTable.id, id),
		columns: {
			id: true,
			name: true,
			hidden: true,
			seed: true, // Include seed if needed
		},
	});

	if (!rawTeam) {
		throw new GraphQLError("Team not found");
	}

	return rawTeam;
};
