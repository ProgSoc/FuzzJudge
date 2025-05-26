import { db } from "@/db";
import { teamTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const deleteTeam: NonNullable<MutationResolvers["deleteTeam"]> = async (
	_parent,
	{ id },
	_ctx,
) => {
	const [deletedTeam] = await db
		.delete(teamTable)
		.where(eq(teamTable.id, id))
		.returning();

	if (!deletedTeam) {
		throw new GraphQLError("Failed to delete team");
	}

	return {
		id: deletedTeam.id,
		name: deletedTeam.name,
		seed: deletedTeam.seed,
	};
};
