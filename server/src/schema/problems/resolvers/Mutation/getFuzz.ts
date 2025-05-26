import { competitionRoot } from "@/config";
import { db } from "@/db";
import { fuzzProblem } from "@/services/problems.service";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const getFuzz: NonNullable<MutationResolvers["getFuzz"]> = async (
	_parent,
	{ slug },
	{ c },
) => {
	const { user } = c.var;
	if (!user) {
		throw new GraphQLError("Unauthorized");
	}
	const { team: teamId } = user;
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
};
