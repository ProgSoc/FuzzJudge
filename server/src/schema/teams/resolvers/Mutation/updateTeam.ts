import { db } from "@/db";
import { teamTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const updateTeam: NonNullable<MutationResolvers["updateTeam"]> = async (
	_parent,
	{ id, name, hidden },
	_ctx,
) => {
	if (
		(name === null || name === undefined) &&
		(hidden === null || hidden === undefined)
	) {
		throw new GraphQLError(
			"At least one of 'name' or 'hidden' must be provided for update",
		);
	}
	const [updatedTeam] = await db
		.update(teamTable)
		.set({ name: name ?? undefined, hidden: hidden ?? undefined }) // Example update
		.where(eq(teamTable.id, id))
		.returning();

	if (!updatedTeam) {
		throw new GraphQLError("Failed to update team");
	}

	return {
		id: updatedTeam.id,
		name: updatedTeam.name,
		seed: updatedTeam.seed,
		hidden: updatedTeam.hidden,
	};
};
