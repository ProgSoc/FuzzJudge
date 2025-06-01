import { db } from "@/db";
import type { QueryResolvers } from "./../../../types.generated";
export const teams: NonNullable<QueryResolvers["teams"]> = async (
	_parent,
	_arg,
	_ctx,
) => {
	const teams = await db.query.teamTable.findMany({
		columns: {
			id: true,
			name: true,
			hidden: true,
			seed: true, // Include seed if needed
		},
	});

	return teams;
};
