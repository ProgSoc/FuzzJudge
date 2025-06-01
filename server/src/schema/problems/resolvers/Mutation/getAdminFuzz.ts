import { competitionRoot } from "@/config";
import { db } from "@/db";
import { fuzzProblem } from "@/services/problems.service";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const getAdminFuzz: NonNullable<
	MutationResolvers["getAdminFuzz"]
> = async (_parent, { slug, teamId }, _ctx) => {
	const team = await db.query.teamTable.findFirst({
		where: (teamTable, { eq }) => eq(teamTable.id, teamId),
	});

	if (!team) {
		throw new GraphQLError("No team found with the provided ID");
	}

	const fuzz = await fuzzProblem(competitionRoot, slug, team.seed);

	return fuzz;
};
