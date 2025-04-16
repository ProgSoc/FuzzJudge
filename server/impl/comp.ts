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

import { indent } from "./util.ts";
import { type MarkdownDocument, loadMarkdown } from "./markdown.ts";
import path from "path";
import fs from "fs";
import { ee } from "./ee.ts";

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

export interface FuzzJudgeProblem {
  toJSON: () => FuzzJudgeProblemMessage;
  slug: string;
  doc: MarkdownDocument;
  points: () => number;
  difficulty: () => number;
  fuzz: (seed: string) => Promise<string>;
  judge: (seed: string, input: string) => Promise<{ correct: boolean; errors?: string }>;
}

export function createFuzzJudgeProblem(slug: string, configPath: string, doc: MarkdownDocument): FuzzJudgeProblem {
  const previousSubmissionTimes: Record<string, number> = {};
  const submissionCounts: Record<string, number> = {};

  const REQUIRED_FIELDS = [
    ["fuzz", "exec"],
    ["judge", "exec"],
    ["problem", "difficulty"],
    ["problem", "points"],
  ];
  const errors: string[] = [];
  for (const [section, value] of REQUIRED_FIELDS) {
    if (Object(doc.front)?.[section] === undefined) {
      errors.push(`Expected section \"${section}\"`);
    }
    if (Object(doc.front)?.[section]?.[value] === undefined) {
      errors.push(`Expected value \"${value}\" in section \"${section}\"`);
    }
  }
  if (errors.length > 0) {
    throw errors.join("\n");
  }

  const cmdFuzz = Object(doc.front).fuzz?.exec?.[0];
  const cmdJudge = Object(doc.front).judge?.exec?.[0];
  const argsFuzz = Array.from(Object(doc.front).fuzz?.exec ?? [])
    .map(String)
    .slice(1);
  const argsJudge = Array.from(Object(doc.front).judge?.exec ?? [])
    .map(String)
    .slice(1);
  const envFuzz = Object(doc.front).fuzz?.env ?? {};
  for (const key in envFuzz) envFuzz[key] = String(envFuzz[key]);

  function toJSON(): FuzzJudgeProblemMessage {
    return {
      slug: slug,
      doc: {
        title: doc.title ?? slug,
        icon: doc.icon,
        summary: doc.summary,
        body: doc.body,
      },
      points: points(),
      difficulty: difficulty(),
    };
  }

  function points(): number {
    return Number(Object(doc.front)?.problem?.points) || 0; // catch NaN
  }

  function difficulty(): number {
    return Number(Object(doc.front)?.problem?.difficulty) || 0; // catch NaN
  }

  async function fuzz(seed: string): Promise<string> {
    // Bun
    const proc = Bun.spawn([cmdFuzz, ...argsFuzz, seed], {
      cwd: path.join(configPath, ".."),
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
      env: envFuzz,
    });
    const out = new Response(proc.stdout);
    const err = new Response(proc.stderr);
    await proc.exited;

    const errText = await err.text();
    if (errText.length > 0) {
      console.error(errText);
      throw new Error(`Fuzzing error: ${errText}`);
    }

    const outText = await out.text();
    if (outText.length === 0) {
      throw new Error("Fuzzing error: no output");
    }

    return outText;
  }

  async function judge(seed: string, input: string): Promise<{ correct: boolean; errors?: string }> {
    const { limited, retry } = handleRateLimiting(seed);
    if (limited) {
      throw new Response(`429 Too Many Requests\n\nRetry after ${retry}s\n`, {
        status: 429,
        headers: [["Retry-After", retry.toFixed(0)]],
      });
    }
    const proc = Bun.spawn([cmdJudge, ...argsJudge, seed], {
      cwd: path.join(configPath, ".."),
      stdin: new Response(input),
      stdout: "pipe",
      stderr: "pipe",
    });

    const out = new Response(proc.stdout);
    const err = new Response(proc.stderr);

    await proc.exited;

    if (proc.exitCode === 0) {
      return { correct: true };
    }

    const errText = await err.text();

    if (errText.length > 0) {
      console.error(errText);
      return { correct: false, errors: errText };
    }

    const outText = await out.text();

    if (outText.length > 0) {
      return { correct: false, errors: outText };
    }

    return { correct: false, errors: "Unknown error" };
  }

  function handleRateLimiting(seed: string): { limited: boolean; retry: number } {
    // Increase the interval by 5 seconds for each submission
    const interval = 5 * 1000 * (submissionCounts[seed] ?? 0); // ms

    if (previousSubmissionTimes[seed] !== undefined) {
      const timeSinceLastSubmission = Date.now() - previousSubmissionTimes[seed];

      if (timeSinceLastSubmission < interval) {
        const secondsToWait = (interval - timeSinceLastSubmission) / 1000;
        return {
          limited: true,
          retry: secondsToWait,
        };
      }
    }

    previousSubmissionTimes[seed] = Date.now();
    submissionCounts[seed] = (submissionCounts[seed] ?? 0) + 1;

    return { limited: false, retry: 0 };
  }

  return {
    toJSON,
    slug,
    doc,
    points,
    difficulty,
    fuzz,
    judge,
  };
}

function walkSync(
  root: string,
  options: {
    includeDirs?: boolean;
    includeSymlinks?: boolean;
    match?: RegExp[];
    maxDepth?: number;
  },
) {
  const { includeDirs = false, includeSymlinks = false, match = [], maxDepth = Infinity } = options;

  const results: fs.Dirent[] = [];

  function walk(dir: string, depth: number) {
    if (depth > maxDepth) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (includeDirs) results.push(entry);
        walk(fullPath, depth + 1);
      } else if (entry.isFile() && (!includeSymlinks || !entry.isSymbolicLink())) {
        if (match.some((regex) => regex.test(entry.name))) results.push(entry);
      }
    }
  }

  walk(root, 0);

  return results;
}

// Static util from class
export function getSlugFromPath(configPath: string): string {
  return path.basename(path.dirname(configPath));
}

export interface FuzzJudgeProblemSet {
  toJSON: () => FuzzJudgeProblemSetMessage;
  addProblem: (slug: string, prob: FuzzJudgeProblem) => void;
  get: (slug: string) => FuzzJudgeProblem | undefined;
  [Symbol.iterator]: () => MapIterator<[string, FuzzJudgeProblem]>;
}

export function createFuzzJudgeProblemSet(root: string): FuzzJudgeProblemSet {
  const problems = new Map<string, FuzzJudgeProblem>();

  for (const ent of walkSync(root, {
    includeDirs: false,
    includeSymlinks: false,
    match: [/prob\.md/],
    maxDepth: 2,
  })) {
    try {
      const slug = getSlugFromPath(ent.path);

      const fileContent = fs.readFileSync(ent.path, "utf-8");

      const problem = createFuzzJudgeProblem(slug, ent.path, loadMarkdown(fileContent, `/comp/prob/${slug}/assets`));
      problems.set(slug, problem);
    } catch (e) {
      const errors = e instanceof Error ? indent("    ", e.toString()) : "Unknown error";
      console.error(`Could not load problem "${ent.path}":\n${errors})}`);
    }
  }

  function toJSON(): FuzzJudgeProblemSetMessage {
    const list = [];
    for (const prob of problems.values()) list.push(prob.toJSON());
    list.sort((a, b) => {
      const difficultyDelta = a.difficulty - b.difficulty;
      const pointsDelta = a.points - b.points;
      const nameSort = a.doc.title < b.doc.title ? -1 : a.doc.title > b.doc.title ? 1 : 0;
      return difficultyDelta || pointsDelta || nameSort;
    });
    return list;
  }

  function addProblem(slug: string, prob: FuzzJudgeProblem) {
    problems.set(slug, prob);
    ee.emit("problems", toJSON());
  }

  function get(slug: string): FuzzJudgeProblem | undefined {
    return problems.get(slug);
  }

  

  return {
    toJSON,
    addProblem,
    get,
    [Symbol.iterator]: () => problems[Symbol.iterator](),
  };
}
