import { competitionRoot } from "@/config";
import { db } from "@/db";
import { getProblemData, judgeProblem } from "@/services/problems.service";
import { postSubmission, solved } from "@/services/submission.service";
import { GraphQLError } from "graphql";
import type { MutationResolvers } from "./../../../types.generated";
export const judge: NonNullable<MutationResolvers["judge"]> = async (
	_parent,
	{ code, output, slug },
	{ user },
) => {
	const { team: teamId } = user;

	if (!teamId) {
		throw new GraphQLError("You are not in a team");
	}

	const userTeam = await db.query.teamTable.findFirst({
		where: (teamTable, { eq }) => eq(teamTable.id, teamId),
	});

	if (!userTeam) {
		throw new GraphQLError("You are not in a team");
	}

	if (await solved({ team: userTeam.id, prob: slug })) {
		throw new GraphQLError("You already solved this problem");
	}

	const time = new Date();

	const { seed } = userTeam;

	try {
		await getProblemData(competitionRoot, slug);
	} catch (error) {
		console.error("Error fetching problem data:", error);
		throw new GraphQLError("Problem not found");
	}

	const t0 = performance.now();
	const judgedProblem = await judgeProblem(competitionRoot, slug, seed, output);
	const t1 = performance.now();

	const { correct } = judgedProblem;

	if (correct) {
		const submission = await postSubmission({
			team: userTeam.id,
			prob: slug,
			time: time.toString(),
			out: output,
			code,
			ok: judgedProblem.correct,
			vler: "",
			vlms: t1 - t0,
		});

		console.log(`✅ Problem ${submission.id} solved by ${user.name}`);

		return {
			__typename: "JudgeSuccessOutput",
			message: "Problem solved",
		};
	}

	const { errors } = judgedProblem;

	const submission = await postSubmission({
		team: userTeam.id,
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
