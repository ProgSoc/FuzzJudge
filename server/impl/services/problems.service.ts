import path from "path";
import matter from "gray-matter";
import { TOML } from "bun";
import { z } from "zod";
import fs from "fs/promises";
import { HTTPException
} from 'hono/http-exception'

/**
 * [fuzz]
exec = ["deno", "run", "fuzz.ts"]
env = {}

[judge]
exec = ["deno", "run", "judge.ts"]

[problem]
points = 20
difficulty = 3
 */

const problemSpec = z.object({
  fuzz: z.object({
    exec: z.array(z.string()),
    env: z.record(z.string()).optional(),
  }),

  judge: z.object({
    exec: z.array(z.string()),
    env: z.record(z.string()).optional(),
  }),

  problem: z.object({
    title: z.string(),
    points: z.number(),
    difficulty: z.number(),
  }),
});

type ProblemSpec = z.infer<typeof problemSpec>;

export async function getProblemData(root: string, slug: string) {
  const problemFile = await Bun.file(path.join(root, slug, "prob.md"))

  if (!problemFile.exists()) {
    throw new HTTPException(404, {
      message: `Problem ${slug} not found`,
    });
  }

  const problemFileContent = await problemFile.text();

  const { data, content } = matter(problemFileContent, {
    engines: {
      toml: TOML.parse,
    },
  });

  const problemData = await problemSpec.safeParseAsync(data);

  if (!problemData.success) {
    throw new Error(`Problem data validation failed: ${problemData.error}`);
  }

  return {
    ...problemData.data,
    content,
  };
}

interface Problem extends ProblemSpec {
  slug: string;
  content: string;
}

/**
 * Get all problems in the competition
 * @param root The root directory of the competition
 * @returns A list of problems and their metadata
 */
export async function getProblems(root: string): Promise<Problem[]> {
  // go through all folders in the root directory
  // only folders that contain a prob.md file are considered problems

  const directoryContent = await fs.readdir(root, { withFileTypes: true });
  const directoryFolders = directoryContent.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);

  // for each folder, check if it contains a prob.md file
  /**
   * Problem paths relative to the root directory
   */
  const problemPaths: string[] = [];

  for (const folder of directoryFolders) {
    const probFile = Bun.file(path.join(root, folder, "prob.md"));
    if (await probFile.exists()) {
      problemPaths.push(folder);
    }
  }

  const problems: Problem[] = [];

  for (const problemPath of problemPaths) {
    const problemData = await getProblemData(root, problemPath);
    problems.push({
      slug: problemPath,
      ...problemData,
    });
  }

  return problems;
}

/**
 * Get a problem by its slug and root directory
 * @param root The root directory of the competition
 * @param slug The slug of the problem e.g. hello-world
 * @returns A Problem object
 */
export async function getProblem(root: string, slug: string): Promise<Problem> {
  const problemData = await getProblemData(root, slug);
  return {
    slug,
    ...problemData,
  };
}

/**
 * Fuzz a problem using the fuzzing executable
 * @param root The root directory of the competition
 * @param slug The slug of the problem e.g. hello-world
 * @param seed The seed to use for the fuzzing
 * @returns The output of the fuzzing process
 */
export async function fuzzProblem(root: string, slug: string, seed: string) {
  const problem = await getProblem(root, slug);
  const configPath = path.join(root, slug);
  const proc = Bun.spawn([...problem.fuzz.exec, seed], {
    cwd: path.join(configPath, ".."),
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
    env: problem.fuzz.env,
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

type JudgeResult =
  | {
      correct: true;
    }
  | {
      correct: false;
      errors: string;
    };

/**
 * Judge a problem using the judge executable
 * @param root The root directory of the competition
 * @param slug The slug of the problem e.g. hello-world
 * @param seed The seed to use for the judge
 * @param input The input to the judge
 * @returns A JudgeResult object
 */
export async function judgeProblem(root: string, slug: string, seed: string, input: string): Promise<JudgeResult> {
  const problem = await getProblem(root, slug); // get the problem metadata
  const configPath = path.join(root, slug); // path to the problem directory (e.g. /path/to/comp/hello-world)

  const proc = Bun.spawn([...problem.judge.exec, seed], {
    cwd: path.join(configPath, ".."),
    stdin: new Response(input),
    stdout: "pipe",
    stderr: "pipe",
  });

  const out = new Response(proc.stdout); 
  const err = new Response(proc.stderr);

  await proc.exited;

  if (proc.exitCode === 0) { 
    // check if the process exited successfully
    return { correct: true };
  }

  const errText = await err.text(); // get the error output

  if (errText.length > 0) {
    return { correct: false, errors: errText }; // return the error output
  }

  const outText = await out.text(); // get the output

  if (outText.length > 0) {
    // check if the output is empty
    return { correct: false, errors: outText };
  }

  return { correct: false, errors: "Unknown error" };
}

/**
 * Problem JSON
 */
