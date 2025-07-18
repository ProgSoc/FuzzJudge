import { competitionRoot } from "@/config";
import { db } from "@/db";
import { pubSub } from "@/pubsub";
import { isFrozen } from "@/services/clock";
import { getProblemData, judgeProblem } from "@/services/problems.service";
import { calculateScoreboard, writeScoreboardToFile } from "@/services/score";
import { postSubmission, solved } from "@/services/submission.service";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
import { ExpiringTokenBucket } from "@/lib/rate-limit";

// you can submit 5 times every 30 seconds
const judgingTokenBucket = new ExpiringTokenBucket<string>(5, 30);

export const judge: NonNullable<MutationResolvers["judge"]> = async (
	_parent,
	{ code, output, slug },
	{ user },
) => {
	const { teamId } = user;

	if (!teamId) {
		throw new GraphQLError("You are not in a team");
	}

	const userTeam = await db.query.teamTable.findFirst({
		where: (teamTable, { eq }) => eq(teamTable.id, teamId),
	});

	if (!userTeam) {
		throw new GraphQLError("You are not in a team");
	}

	if (await solved({ team: teamId, prob: slug })) {
		throw new GraphQLError("You already solved this problem");
	}

	if (!judgingTokenBucket.check(teamId, 1)) {
		throw new GraphQLError("You are submitting too fast, please wait a bit");
	}

	const time = new Date();

	const { seed } = userTeam;

	try {
		await getProblemData(competitionRoot, slug);
	} catch (error) {
		console.error("Error fetching problem data:", error);
		throw new GraphQLError("Problem not found");
	}

	if (!judgingTokenBucket.consume(teamId, 1)) {
		throw new GraphQLError("You are submitting too fast, please wait a bit");
	}

	const t0 = performance.now();
	const judgedProblem = await judgeProblem(competitionRoot, slug, seed, output);
	const t1 = performance.now();

	const { correct } = judgedProblem;

	if (correct) {
		const submission = await postSubmission({
			teamId: teamId,
			prob: slug,
			time: time.toString(),
			out: output,
			code,
			ok: judgedProblem.correct,
			vler: "",
			vlms: t1 - t0,
		});

		judgingTokenBucket.reset(teamId);

		console.log(`✅ Problem ${submission.id} solved by ${user.name}`);

		const frozen = await isFrozen();
		const scoreboard = await calculateScoreboard();
		if (!frozen) {
			await writeScoreboardToFile(scoreboard);
		}

		pubSub.publish("scoreboard", scoreboard);

		return {
			__typename: "JudgeSuccessOutput",
			message: "Problem solved",
		};
	}

	const { errors } = judgedProblem;

	const submission = await postSubmission({
		teamId: teamId,
		prob: slug,
		time: time.toString(),
		out: output,
		code,
		ok: correct,
		vler: errors,
		vlms: t1 - t0,
	});
	console.log(`❌ Problem ${submission.id} not solved by ${user.name}`);

	return {
		__typename: "JudgeErrorOutput",
		message: "Problem not solved",
		errors,
	};
};
