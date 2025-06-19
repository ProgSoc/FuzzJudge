import { and, eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import { db } from "../db";
import { type Submission, submissionTable } from "../db/schema";

interface SubmissionParams extends Omit<Submission, "out" | "code" | "vler"> {
	out: string;
	code: string;
	vler: string;
}

export async function solved(params: {
	team: number;
	prob: string;
}): Promise<boolean> {
	const solved = await db.query.submissionTable.findFirst({
		where: (table, { and }) =>
			and(
				eq(table.team, params.team),
				eq(table.prob, params.prob),
				eq(table.ok, true),
			),
	});

	return solved !== undefined;
}

export async function postSubmission(
	{ code, ok, out, prob, team, time, vler, vlms }: Omit<SubmissionParams, "id">,
	resubmit = false,
): Promise<Submission> {
	if (resubmit && ok) {
		if (!prob || !team)
			throw new GraphQLError("Missing prob or team for resubmit");

		const [submission] = await db
			.update(submissionTable)
			.set({
				out,
				code,
				vler,
				vlms,
			})
			.where(
				and(
					eq(submissionTable.prob, prob),
					eq(submissionTable.team, team),
					eq(submissionTable.ok, true),
				),
			)
			.returning();

		if (!submission) throw new GraphQLError("Failed to update submission");

		return submission;
	}

	const [newSub] = await db
		.insert(submissionTable)
		.values({
			team,
			prob,
			time,
			out,
			code,
			ok,
			vler,
			vlms,
		})
		.returning()
		.onConflictDoNothing();

	if (!newSub) throw new GraphQLError("Failed to insert submission");

	return newSub;
}
