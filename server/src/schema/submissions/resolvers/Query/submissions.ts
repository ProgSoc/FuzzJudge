import { db } from "@/db";
import { submissionTable } from "@/db/schema";
import { ensureRole } from "@/middleware/graphQLAuthMiddleware";
import { type SQL, eq } from "drizzle-orm";
import type { QueryResolvers } from "./../../../types.generated";
export const submissions: NonNullable<QueryResolvers["submissions"]> = async (
	_parent,
	{ teamId, problemSlug },
	{ c },
) => {
	await ensureRole(c, ["admin"]);
	const conditions: SQL[] = [];

	if (teamId) {
		conditions.push(eq(submissionTable.team, teamId));
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
		teamId: submission.team,
	}));
};
