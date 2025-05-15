import { db } from "@/db";
import { teamTable } from "@/db/schema";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const createTeam: NonNullable<MutationResolvers["createTeam"]> = async (
	_parent,
	{ name },
	_ctx,
) => {
	const seed = [...crypto.getRandomValues(new Uint8Array(8))]
		.map((v) => v.toString(16).padStart(2, "0"))
		.join("");
	const [newTeam] = await db
		.insert(teamTable)
		.values({
			name,
			seed,
		})
		.returning();

	if (!newTeam) {
		throw new GraphQLError("Failed to create team");
	}

	return {
		id: newTeam.id,
		name: newTeam.name,
		seed: newTeam.seed,
	};
};
