import { db } from "@/db";
import { submissionTable } from "@/db/schema";
import { type SQL, eq } from "drizzle-orm";
import type { QueryResolvers } from "./../../../types.generated";
export const submissions: NonNullable<QueryResolvers["submissions"]> = async (
	_parent,
	{ teamId, problemSlug },
	_context,
) => {
	const conditions: SQL[] = [];

	if (teamId) {
		conditions.push(eq(submissionTable.teamId, teamId));
	}

	if (problemSlug) {
		conditions.push(eq(submissionTable.prob, problemSlug));
	}

	const rawSubmission = await db.query.submissionTable.findMany({
		where: (_, { and }) => and(...conditions),
	});

	return rawSubmission.map((submission) => ({
		id: submission.id,
		problemSlug: submission.prob,
		time: new Date(submission.time),
		ok: submission.ok ?? undefined,
		out: submission.out ?? undefined,
		code: submission.code ?? undefined,
		vler: submission.vler ?? undefined,
		teamId: submission.teamId,
	}));
};
