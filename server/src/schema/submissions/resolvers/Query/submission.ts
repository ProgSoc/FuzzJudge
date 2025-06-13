import { db } from "@/db";
import { GraphQLError } from "graphql";
import type { QueryResolvers } from "./../../../types.generated";
export const submission: NonNullable<QueryResolvers["submission"]> = async (
	_parent,
	{ id },
) => {
	const rawSubmission = await db.query.submissionTable.findFirst({
		where: (submissionTable, { eq }) => eq(submissionTable.id, id),
	});

	if (!rawSubmission) {
		throw new GraphQLError("Submission not found");
	}

	return {
		id: rawSubmission.id,
		problemSlug: rawSubmission.prob,
		time: new Date(rawSubmission.time),
		ok: rawSubmission.ok ?? undefined,
		out: rawSubmission.out ?? undefined,
		code: rawSubmission.code ?? undefined,
		vler: rawSubmission.vler ?? undefined,
		teamId: rawSubmission.team,
	};
};
