import { db } from "@/db";
import { submissionTable } from "@/db/schema";
import { pubSub } from "@/pubsub";
import { calculateScoreboard, writeScoreboardToFile } from "@/services/score";
import { isFrozen } from "@/v1/clock";
import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const overrideJudge: NonNullable<
	MutationResolvers["overrideJudge"]
> = async (_parent, { solved, submissionId }, _ctx) => {
	const [updated] = await db
		.update(submissionTable)
		.set({
			ok: solved,
		})
		.where(eq(submissionTable.id, submissionId))
		.returning();

	if (!updated) {
		throw new GraphQLError("Submission not found");
	}

	const frozen = await isFrozen();
	const scoreboard = await calculateScoreboard();
	if (!frozen) {
		await writeScoreboardToFile(scoreboard);
	}
	pubSub.publish("scoreboard", scoreboard);

	return {
		id: updated.id,
		ok: updated.ok ?? undefined,
		problemSlug: updated.prob,
		teamId: updated.team,
		time: updated.time,
		code: updated.code ?? undefined,
		out: updated.out ?? undefined,
		vler: updated.vler ?? undefined,
		vlms: updated.vlms ?? undefined,
	};
};
