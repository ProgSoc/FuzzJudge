import path from "node:path";
import { competitionRoot } from "@/config";
import { GraphQLError } from "graphql";
import { z } from "zod";
import { db } from "../db";
import { getCompetitionData } from "./competition.service";
import { getProblems } from "./problems.service";

const problemScoreSpec = z.object({
	slug: z.string(),
	solved: z.boolean(),
	points: z.number(),
	penalty: z.number(),
	tries: z.number(),
});

type ProblemScore = z.infer<typeof problemScoreSpec>;

const scoreboardRowSpec = z.object({
	teamId: z.string(),
	teamHidden: z.boolean(),
	points: z.number(),
	penalty: z.number(),
	problems: z.array(problemScoreSpec),
});

export type ScoreboardRow = z.infer<typeof scoreboardRowSpec>;

/**
 * Generate the entire scoreboard
 * @param root The competition root directory
 * @param startTim The start time of the competition
 * @return The scoreboard with all teams and their scores
 */
export async function calculateScoreboard(): Promise<ScoreboardRow[]> {
	const competitionData = await getCompetitionData(competitionRoot);

	const startTime = competitionData.times.start;
	if (!startTime) {
		throw new GraphQLError("Competition start time is not defined");
	}
	// Load the problem set
	const problemsData = await getProblems(competitionRoot);

	// Map the problems to a new object with only the slug and points
	const problems = problemsData.map((problem) => ({
		slug: problem.slug,
		points: problem.problem.points,
	}));

	// for each team, get the submissions grouped by problem
	const teamsAndSubmissions = await db.query.teamTable.findMany({
		columns: {
			id: true,
			hidden: true, // Include hidden field if needed
		},
		with: {
			submissions: {
				columns: {
					prob: true,
					time: true,
					ok: true,
				},
			},
		},
	});

	/**
	 * Filter out teams with no submissions
	 * and map the teams to a new object with only the id, name, and submissions
	 */
	const teams = teamsAndSubmissions
		.filter((team) => team.submissions.length > 0) // Filter out teams with no submissions
		.map((team) => ({
			id: team.id,
			submissions: team.submissions,
			hidden: team.hidden,
		}));

	/**
	 * Calculate the score for each team
	 */
	const teamScore = teams.map((team) => {
		/**
		 * For each team, we calculate the score for each problem
		 * The score is calculated based on the submissions for each problem
		 */
		const problemScores = problems.map((problem) => {
			let latest = Number.NEGATIVE_INFINITY;
			let solved = false;

			/** Filter the submissions for the current problem */
			const currentProblemSubmissions = team.submissions.filter(
				(submission) => submission.prob === problem.slug,
			);

			/** Calculate the number of tries */
			const tries = currentProblemSubmissions.reduce((acc, submission) => {
				latest = Math.max(latest, new Date(submission.time).getTime()); // Get the latest submission time
				if (submission.ok) {
					solved = true; // If the submission is correct, we mark it as solved
					return acc; // If the submission is correct, we don't count it as a try
				}
				return acc + 1; // Count the try
			}, 0);

			/** Time since the start of the competition */
			const timeSinceStart = Math.max(
				0,
				(latest - startTime.getTime()) / 60_000,
			);

			/** The problem penalty */
			const penalty = Math.floor(timeSinceStart) + 20 * tries; // 20 minutes penalty for each wrong submission

			return {
				slug: problem.slug, // Problem slug
				solved, // Whether the problem was solved or not
				points: solved ? problem.points : 0, // Points are only awarded if the problem is solved
				penalty: solved ? penalty : 0, // Penalty is only shown if the problem is solved
				tries, // Number of tries
			};
		});

		/**
		 * Calculate the total score for the team
		 * The total score is the sum of the points and penalties for each problem
		 */
		const totalScore = problemScores.reduce(
			(acc, score) => {
				acc.points += score.points;
				acc.penalty += score.penalty;
				return acc;
			},
			{
				/** Total points */
				points: 0,
				/** Total penalty */
				penalty: 0,
			},
		);

		return {
			/** Team Name */
			teamId: team.id,
			/**  Team Hidden */
			teamHidden: team.hidden,
			/**  Total points */
			points: totalScore.points,
			/** Total Penalty (Not Applied) */
			penalty: totalScore.penalty,
			/** Problem Score Breakdown */
			problems: problemScores,
		};
	});

	/**
	 * Sort the teams by score
	 * The teams are sorted by points, then by penalty
	 */
	const scoreboard = teamScore.map(
		({ points, penalty, problems, teamId, teamHidden }) => ({
			/** Team Name */
			teamId,
			/** Team Hidden */
			teamHidden,
			/** Total Points */
			points,
			/** Total Penalty (Not Applied) */
			penalty,
			/** Problem Score Breakdown */
			problems,
		}),
	);

	return scoreboard;
}

let cachedScoreboard: ScoreboardRow[] | null = null;

export const getCachedScoreboard = async (): Promise<ScoreboardRow[]> => {
	if (cachedScoreboard) {
		return cachedScoreboard; // Return cached scoreboard if available
	}
	const filePath = path.join(competitionRoot, "scoreboard.json");
	try {
		const scoreboardData = await Bun.file(filePath).json();

		// safe parse the scoreboard data
		const parsedScoreboard = scoreboardRowSpec
			.array()
			.safeParse(scoreboardData);
		if (parsedScoreboard.success) {
			return parsedScoreboard.data;
		}
		console.error("Invalid scoreboard data format:", parsedScoreboard.error);
		return [];
	} catch (error) {
		console.error("Error reading cached scoreboard:", error);
		return [];
	}
};

/**
 * Write the scoreboard to a file
 * @param scoreboard The scoreboard to write to the file
 */
export const writeScoreboardToFile = async (
	scoreboard: ScoreboardRow[],
): Promise<void> => {
	cachedScoreboard = scoreboard; // Cache the scoreboard for future use
	const filePath = path.join(competitionRoot, "scoreboard.json");
	try {
		await Bun.write(filePath, JSON.stringify(scoreboard, null, 2));
	} catch (error) {
		console.error("Error writing scoreboard to file:", error);
	}
};

/**
 * Calculate the score for a single team (used for incremental updates) of the scoreboard
 * @param root The competition root directory
 * @param startTime The start time of the competition
 * @param teamId The id of the team to calculate the score for
 * @returns The score for the team
 */
async function calculateTeamScore(
	teamId: string,
): Promise<Omit<ScoreboardRow, "rank"> | null> {
	// Load the problem set
	const problemsData = await getProblems(competitionRoot);

	const competitionData = await getCompetitionData(competitionRoot);

	const startTime = competitionData.times.start;

	if (!startTime) {
		throw new GraphQLError("Competition start time is not defined");
	}

	const team = await db.query.teamTable.findFirst({
		where: (teamTable, { eq }) => eq(teamTable.id, teamId),
		columns: {
			id: true,
			hidden: true, // Include hidden field if needed
		},
	});
	if (!team) {
		throw new GraphQLError(`Team with id ${teamId} not found`);
	}

	// Map the problems to a new object with only the slug and points
	const problems = problemsData.map((problem) => ({
		slug: problem.slug,
		points: problem.problem.points,
	}));

	const submissions = await db.query.submissionTable.findMany({
		where: (submission, { eq }) => eq(submission.teamId, teamId),
		columns: {
			prob: true,
			time: true,
			ok: true,
		},
	});

	if (submissions.length === 0) return null;

	/**
	 * For each team, we calculate the score for each problem
	 * The score is calculated based on the submissions for each problem
	 */
	const problemScores = problems.map((problem) => {
		let latest = Number.NEGATIVE_INFINITY;
		let solved = false;

		/** Filter the submissions for the current problem */
		const currentProblemSubmissions = submissions.filter(
			(submission) => submission.prob === problem.slug,
		);

		/** Calculate the number of tries */
		const tries = currentProblemSubmissions.reduce((acc, submission) => {
			latest = Math.max(latest, new Date(submission.time).getTime()); // Get the latest submission time
			if (submission.ok) {
				solved = true; // If the submission is correct, we mark it as solved
				return acc; // If the submission is correct, we don't count it as a try
			}
			return acc + 1; // Count the try
		}, 0);

		/** Time since the start of the competition */
		const timeSinceStart = Math.max(0, (latest - startTime.getTime()) / 60_000);

		/** The problem penalty */
		const penalty = Math.floor(timeSinceStart) + 20 * tries; // 20 minutes penalty for each wrong submission

		return {
			slug: problem.slug, // Problem slug
			solved, // Whether the problem was solved or not
			points: solved ? problem.points : 0, // Points are only awarded if the problem is solved
			penalty: solved ? penalty : 0, // Penalty is only shown if the problem is solved
			tries, // Number of tries
		};
	});

	/**
	 * Calculate the total score for the team
	 * The total score is the sum of the points and penalties for each problem
	 */
	const totalScore = problemScores.reduce(
		(acc, score) => {
			acc.points += score.points;
			acc.penalty += score.penalty;
			return acc;
		},
		{
			/** Total points */
			points: 0,
			/** Total penalty */
			penalty: 0,
		},
	);

	return {
		/** Team Name */
		teamId,
		/** Team Hidden */
		teamHidden: team.hidden,
		/**  Total points */
		points: totalScore.points,
		/** Total Penalty (Not Applied) */
		penalty: totalScore.penalty,
		/** Problem Score Breakdown */
		problems: problemScores,
	};
}
