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

import { Subscribable } from "./util.ts";
import { CompetitionDB } from "./db.ts";
import { CompetitionClock } from "./clock.ts";
import { FuzzJudgeProblem } from "./comp.ts";

export type ProblemScore = {
  points: number,
  penalty: number,
  tries: number,
  solved: boolean,
};

export type TeamScore = {
  total: { points: number, penalty: number },
  problems: Record<string, ProblemScore>,
};

export type CompetitionScoreboardMessage = {
  rank: number,
  name: string,
  score: TeamScore,
}[];

export class CompetitionScoreboard extends Subscribable<CompetitionScoreboardMessage> {
  #db: CompetitionDB;
  #clock: CompetitionClock;
  #problems: Record<string, FuzzJudgeProblem>;
  #frozen: boolean;

  constructor(opts: { db: CompetitionDB, clock: CompetitionClock, problems: Record<string, FuzzJudgeProblem> }) {
    super(() => this.fullScoreboard());
    this.#db = opts.db;
    this.#clock = opts.clock;
    this.#problems = opts.problems;
    this.#frozen = false;
    this.#db.subscribe(() => this.notify(this.fullScoreboard()));
  }

  teamScoreboard(team: number) {
    // return sorted by score (then penalty score)
    const teamScore: TeamScore = { total: { points: 0, penalty: 0 }, problems: {} };
    for (const [slug, prob] of Object.entries(this.#problems)) {
      const submissions = this.#db.getSubmissionSkeletons(team, slug);
      const score: ProblemScore = {
        points: 0,
        penalty: 0,
        tries: submissions.length,
        solved: false,
      };
      let nPenalties = 0;
      let latest = -Infinity;
      for (const { ok, time } of submissions) {
        if (ok) {
          score.points = prob.points();
          score.solved = true;
        } else {
          ++nPenalties;
        }
        if (time.getTime() > latest) latest = time.getTime();
      }
      // minutesSinceStart + 20 * failedTries
      score.penalty = Math.max(0, (latest - this.#clock.now().start.getTime()) / 60_000) + 20 * nPenalties;
      teamScore.total.points += score.points;
      teamScore.total.penalty += score.penalty;
      teamScore.problems[slug];
    }
    return teamScore;
  }

  fullScoreboard(): CompetitionScoreboardMessage {
    if (this.#frozen) {
      return JSON.parse(this.#db.getOrSetDefaultMeta("/comp/scoreboard.frozen")!);
    }
    const rankings = [];
    for (const team of this.#db.teams()) {
      rankings.push({
        rank: 0,
        name: team.name,
        score: this.teamScoreboard(team.id),
      });
    }
    rankings.sort((a, b) => {
      const pointsDelta = a.score.total.points - b.score.total.points;
      const penaltyDelta = a.score.total.penalty - b.score.total.penalty;
      return pointsDelta || penaltyDelta;
    });
    return rankings;
  }

  freeze() {
    this.#db.getOrSetDefaultMeta("/comp/scoreboard.frozen", JSON.stringify(this.fullScoreboard()));
    this.#frozen = true;
  }

  unfreeze() {
    this.#frozen = false;
  }
}
