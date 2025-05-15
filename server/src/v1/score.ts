/*
 * FuzzJudge - Randomised input judging server, designed for ProgComp.
 * Copyright (C) 2024 UTS Programmers' Society (ProgSoc)
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { ee } from "../ee.ts";
import { getOrSetDefaultMeta } from "../services/meta.service.ts";
import type { Problem } from "../services/problems.service.ts";
import { getSubmissionSkeletons } from "../services/submission.service.ts";
import { allTeams } from "../services/team.service.ts";
import type { CompetitionClock } from "./clock.ts";

type ProblemScore = {
	points: number;
	penalty: number;
	tries: number;
	solved: boolean;
};

type TeamScore = {
	total: { points: number; penalty: number };
	problems: Record<string, ProblemScore>;
};

export type CompetitionScoreboardMessage = {
	rank: number;
	name: string;
	score: TeamScore;
}[];

export function createCompetitionScoreboard(
	clock: CompetitionClock,
	problems: Problem[],
) {
	let frozen = false;

	ee.on("scoreboardUpdate", async () => {
		ee.emit("scoreboard", await fullScoreboard());
	});

	async function teamScoreboard(team: number) {
		// return sorted by score (then penalty score)
		const teamScore: TeamScore = {
			total: { points: 0, penalty: 0 },
			problems: {},
		};
		for (const problem of problems) {
			const submissions = await getSubmissionSkeletons(team, problem.slug);
			const score: ProblemScore = {
				points: 0,
				penalty: 0,
				tries: submissions.length,
				solved: false,
			};
			let nPenalties = 0;
			let latest = Number.NEGATIVE_INFINITY;
			for (const { ok, time } of submissions) {
				if (ok) {
					score.points = problem.problem.points;
					score.solved = true;
				} else {
					++nPenalties;
				}
				if (time.getTime() > latest) latest = time.getTime();
			}
			// minutesSinceStart + 20 * failedTries
			score.penalty =
				Math.max(0, (latest - clock.now().start.getTime()) / 60_000) +
				20 * nPenalties;
			teamScore.total.points += score.points;
			teamScore.total.penalty += score.penalty;
			teamScore.problems[problem.slug] = score;
		}
		return teamScore;
	}

	async function fullScoreboard(): Promise<CompetitionScoreboardMessage> {
		if (frozen) {
			const frozenMeta = await getOrSetDefaultMeta("/comp/scoreboard.frozen");
			if (frozenMeta) {
				return JSON.parse(frozenMeta) as CompetitionScoreboardMessage;
			}
		}
		const rankings: CompetitionScoreboardMessage = [];
		for (const team of await allTeams()) {
			rankings.push({
				rank: 0,
				name: team.name,
				score: await teamScoreboard(team.id),
			});
		}
		rankings.sort((a, b) => {
			const pointsDelta = b.score.total.points - a.score.total.points;
			const penaltyDelta = a.score.total.penalty - b.score.total.penalty;
			return pointsDelta || penaltyDelta;
		});
		return rankings;
	}

	function freeze() {
		getOrSetDefaultMeta(
			"/comp/scoreboard.frozen",
			JSON.stringify(fullScoreboard()),
		);
		frozen = true;
	}

	function unfreeze() {
		frozen = false;
	}

	return {
		teamScoreboard,
		fullScoreboard,
		freeze,
		unfreeze,
	};
}
