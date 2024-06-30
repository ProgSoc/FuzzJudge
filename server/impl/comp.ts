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

import { TermColours, basename, dirname, pathJoin, walkSync } from "../deps.ts";
import { indent } from "./util.ts";
import { MarkdownDocument, loadMarkdown } from "./markdown.ts";
import { Subscribable } from "./subscribable.ts";

export type FuzzJudgeProblemMessage = {
  slug: string;
  doc: {
    title: string;
    icon?: string;
    summary?: string;
    body: string;
  };
  points: number;
  difficulty: number;
};

export type FuzzJudgeProblemSetMessage = FuzzJudgeProblemMessage[];

export class FuzzJudgeProblem {
  #doc: MarkdownDocument;
  #configPath: string;
  #slug: string;
  #cmdFuzz: string;
  #cmdJudge: string;
  #argsFuzz: string[];
  #argsJudge: string[];
  #envFuzz: Record<string, string>;
  #previousSubmissionTimes: Record<string, number> = {};
  #submissionCounts: Record<string, number> = {};

  static getSlug(configPath: string): string {
    return basename(dirname(configPath));
  }

  constructor(slug: string, configPath: string, doc: MarkdownDocument) {
    this.#doc = doc;
    this.#configPath = configPath;
    this.#slug = slug;

    const REQUIRED_FIELDS = [["fuzz", "exec"], ["judge", "exec"], ["problem", "difficulty"], ["problem", "points"]];
    const errors: string[] = [];
    for (const [section, value] of REQUIRED_FIELDS) {
      if (Object(doc.front)?.[section] === undefined) {
        errors.push(`Expected section \"${section}\"`)
      }
      if (Object(doc.front)?.[section]?.[value] === undefined) {
        errors.push(`Expected value \"${value}\" in section \"${section}\"`);
      }
    }
    if (errors.length > 0) {
      throw errors.join("\n");
    }

    this.#cmdFuzz = Object(doc.front).fuzz?.exec?.[0];
    this.#cmdJudge = Object(doc.front).judge?.exec?.[0];
    this.#argsFuzz = Array.from(Object(doc.front).fuzz?.exec ?? [])
      .map(String)
      .slice(1);
    this.#argsJudge = Array.from(Object(doc.front).judge?.exec ?? [])
      .map(String)
      .slice(1);
    this.#envFuzz = Object(doc.front).fuzz?.env ?? {};
    for (const key in this.#envFuzz) this.#envFuzz[key] = String(this.#envFuzz[key]);
  }

  toJSON(): FuzzJudgeProblemMessage {
    return {
      slug: this.#slug,
      doc: {
        title: this.#doc.title ?? this.#slug,
        icon: this.#doc.icon,
        summary: this.#doc.summary,
        body: this.#doc.body,
      },
      points: this.points(),
      difficulty: this.difficulty(),
    };
  }

  slug(): string {
    return this.#slug;
  }

  doc(): MarkdownDocument {
    return this.#doc;
  }

  points(): number {
    return Number(Object(this.#doc.front)?.problem?.points) || 0; // catch NaN
  }

  difficulty(): number {
    return Number(Object(this.#doc.front)?.problem?.difficulty) || 0; // catch NaN
  }

  async fuzz(seed: string): Promise<string> {
    const proc = new Deno.Command(this.#cmdFuzz, {
      args: [...this.#argsFuzz, seed],
      cwd: pathJoin(this.#configPath, ".."),
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
      env: this.#envFuzz,
    }).spawn();
    const out = await proc.output();
    if (!out.success) console.error(new TextDecoder().decode(out.stderr));
    return new TextDecoder().decode(out.stdout);
  }

  async judge(seed: string, input: string): Promise<{ correct: boolean; errors?: string }> {
    const { limited, retry } = this.#handleRateLimiting(seed);
    if (limited) {
      throw new Response(`429 Too Many Requests\n\nRetry after ${retry}s\n`, {
        status: 429,
        headers: [["Retry-After", retry.toFixed(0)]],
      });
    }

    const proc = new Deno.Command(this.#cmdJudge, {
      args: [...this.#argsJudge, seed],
      cwd: pathJoin(this.#configPath, ".."),
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    }).spawn();
    await new Response(input).body?.pipeTo(proc.stdin);
    const out = await proc.output();
    const err = new TextDecoder().decode(out.stderr);

    if (out.success) return { correct: true };
    else return { correct: false, errors: err };
  }

  #handleRateLimiting(seed: string): { limited: boolean; retry: number } {
    // Increase the interval by 5 seconds for each submission
    const interval = 5 * 1000 * (this.#submissionCounts[seed] ?? 0); // ms

    if (this.#previousSubmissionTimes[seed] !== undefined) {
      const timeSinceLastSubmission = Date.now() - this.#previousSubmissionTimes[seed];

      if (timeSinceLastSubmission < interval) {
        const secondsToWait = (interval - timeSinceLastSubmission) / 1000;
        return {
          limited: true,
          retry: secondsToWait,
        };
      }
    }

    this.#previousSubmissionTimes[seed] = Date.now();
    this.#submissionCounts[seed] = (this.#submissionCounts[seed] ?? 0) + 1;

    return { limited: false, retry: 0 };
  }
}

export class FuzzJudgeProblemSet extends Subscribable<FuzzJudgeProblemSetMessage> {
  #problems: Map<string, FuzzJudgeProblem> = new Map();

  constructor(root: string) {
    super(() => this.toJSON());
    for (const ent of walkSync(root, {
      includeDirs: false,
      includeSymlinks: false,
      match: [/prob\.md/],
      maxDepth: 2,
    })) {
      try {
        const slug = FuzzJudgeProblem.getSlug(ent.path);
        const problem = new FuzzJudgeProblem(
          slug,
          ent.path,
          loadMarkdown(Deno.readTextFileSync(ent.path), `/comp/prob/${slug}/assets`),
        );
        this.#problems.set(slug, problem);
      } catch (e) {
        const errors = indent("    ", e.toString());
        console.error(`${TermColours.red("ERR")} Could not load problem "${ent.path}":\n${errors})}`);
      }
    }
  }

  [Symbol.iterator]() {
    return this.#problems[Symbol.iterator]();
  }

  toJSON(): FuzzJudgeProblemSetMessage {
    const list = [];
    for (const prob of this.#problems.values()) list.push(prob.toJSON());
    list.sort((a, b) => {
      const difficultyDelta = a.difficulty - b.difficulty;
      const pointsDelta = a.points - b.points;
      const nameSort = (a.doc.title < b.doc.title) ? -1 : (a.doc.title > b.doc.title ? 1 : 0);
      return difficultyDelta || pointsDelta || nameSort;
    });
    return list;
  }

  #addProblem(slug: string, prob: FuzzJudgeProblem) {
    this.#problems.set(slug, prob);
    this.notify(this.toJSON());
  }

  get(slug: string): FuzzJudgeProblem | undefined {
    return this.#problems.get(slug);
  }
}
