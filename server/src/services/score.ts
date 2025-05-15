import { competitionRoot } from "@/config";
import type { ScoreboardRowMapper } from "@/schema/scoreboard/schema.mappers";
import { db } from "../db";
import { getCompetitionData } from "./competition.service";
import { getProblems } from "./problems.service";

/**
 * Generate the entire scoreboard
 * @param root The competition root directory
 * @param startTim The start time of the competition
 * @return The scoreboard with all teams and their scores
 */
export async function calculateScoreboard(): Promise<ScoreboardRowMapper[]> {
	const competitionData = await getCompetitionData(competitionRoot);

	const startTime = competitionData.times.start;
	if (!startTime) {
		throw new Error("Competition start time is not defined");
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
			name: true,
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
		({ points, penalty, problems, teamId }, index) => ({
			/** Rank of the team */
			rank: index + 1,
			/** Team Name */
			teamId,
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

/**
 * Calculate the score for a single team (used for incremental updates) of the scoreboard
 * @param root The competition root directory
 * @param startTime The start time of the competition
 * @param teamId The id of the team to calculate the score for
 * @returns The score for the team
 */
async function calculateTeamScore(
	teamId: number,
): Promise<Omit<ScoreboardRowMapper, "rank"> | null> {
	// Load the problem set
	const problemsData = await getProblems(competitionRoot);

	const competitionData = await getCompetitionData(competitionRoot);

	const startTime = competitionData.times.start;

	if (!startTime) {
		throw new Error("Competition start time is not defined");
	}

	// Map the problems to a new object with only the slug and points
	const problems = problemsData.map((problem) => ({
		slug: problem.slug,
		points: problem.problem.points,
	}));

	const submissions = await db.query.submissionTable.findMany({
		where: (submission, { eq }) => eq(submission.team, teamId),
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
		/**  Total points */
		points: totalScore.points,
		/** Total Penalty (Not Applied) */
		penalty: totalScore.penalty,
		/** Problem Score Breakdown */
		problems: problemScores,
	};
}
