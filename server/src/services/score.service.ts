import { z } from "@hono/zod-openapi";
import { db } from "../db";
import { getProblems } from "./problems.service";

export async function calculateScoreboard(root: string, startTime: Date) {
	// Load the problem set
	const problemsData = await getProblems(root);

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
			name: team.name,
			submissions: team.submissions,
		}));

	/**
	 * Calculate the score for each team
	 */
	const teamScore: TeamScore[] = teams.map((team) => {
		/**
		 * For each team, we calculate the score for each problem
		 * The score is calculated based on the submissions for each problem
		 */
		const problemScores = problems.map((problem): ProblemScore => {
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
			name: team.name,
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
	const scoreboard: Scoreboard = teamScore
		.sort((a, b) => {
			if (a.points === b.points) {
				return a.penalty - b.penalty; // Sort by penalty if points are equal
			}
			return b.points - a.points; // Sort by points
		})
		.map(({ points, penalty, problems, name }, index) => ({
			/** Rank of the team */
			rank: index + 1,
			/** Team Name */
			name,
			/** Total Points */
			points,
			/** Total Penalty (Not Applied) */
			penalty,
			/** Problem Score Breakdown */
			problems,
		}));

	return scoreboard;
}

const ProblemScoreSchema = z
	.object({
		slug: z.string().openapi({
			description: "Problem slug",
		}),
		points: z.number().openapi({
			description: "Points for the problem",
		}),
		penalty: z.number().openapi({
			description: "Penalty time in minutes",
		}),
		tries: z.number().openapi({
			description: "Number of tries",
		}),
		solved: z.boolean().openapi({
			description: "Whether the problem was solved or not",
		}),
	})
	.openapi("ProblemScore");

const TeamScoreSchema = z
	.object({
		name: z.string().openapi({
			description: "Team name",
		}),
		points: z.number().openapi({
			description: "Total points",
		}),
		penalty: z.number().openapi({
			description: "Total penalty time in minutes",
		}),
		problems: z.array(ProblemScoreSchema).openapi({
			description: "Problem score breakdown",
		}),
	})
	.openapi("TeamScore");

const RankedTeamScoreSchema = TeamScoreSchema.extend({
	rank: z.number().openapi({
		description: "Rank of the team",
	}),
}).openapi("RankedTeamScore");

export const ScoreboardSchema = z
	.array(RankedTeamScoreSchema)
	.openapi("Scoreboard");

export type Scoreboard = z.infer<typeof ScoreboardSchema>;
export type TeamScore = z.infer<typeof TeamScoreSchema>;
export type ProblemScore = z.infer<typeof ProblemScoreSchema>;
export type RankedTeamScore = z.infer<typeof RankedTeamScoreSchema>;
