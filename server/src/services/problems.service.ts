import fs from "node:fs/promises";
import path from "node:path";
import { GraphQLError } from "graphql";
import { z } from "zod";
import { readMarkdown } from "../lib/writeMd";

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
		points: z.number(),
		difficulty: z.number(),
	}),
});

type ProblemSpec = z.infer<typeof problemSpec>;

interface MarkdownAttributes {
	title: string;
	icon: string;
	body: string;
}

export async function getProblemData(root: string, slug: string) {
	const probPath = path.join(root, slug, "prob.md");

	const { content, frontmatter } = await readMarkdown(probPath, problemSpec);

	const attributes = parseMarkdownAttributes(content);

	return {
		...frontmatter,
		attributes,
		slug,
		content,
	};
}

export interface Problem extends ProblemSpec {
	slug: string;
	content: string;
	attributes: MarkdownAttributes;
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
	const directoryFolders = directoryContent
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

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
		problems.push(problemData);
	}

	return problems.sort((a, b) => {
		// Sort by difficulty first, then by points
		// This ensures that problems with the same difficulty are sorted by points
		if (a.problem.difficulty !== b.problem.difficulty) {
			return a.problem.difficulty - b.problem.difficulty;
		}
		return a.problem.points - b.problem.points;
	});
}

/**
 * Fuzz a problem using the fuzzing executable
 * @param root The root directory of the competition
 * @param slug The slug of the problem e.g. hello-world
 * @param seed The seed to use for the fuzzing
 * @returns The output of the fuzzing process
 */
export async function fuzzProblem(root: string, slug: string, seed: string) {
	const problem = await getProblemData(root, slug);
	const configPath = path.join(root, slug);
	const proc = Bun.spawn([...problem.fuzz.exec, seed], {
		cwd: configPath,
		stdin: "pipe",
		stdout: "pipe",
		stderr: "pipe",
		env: { ...problem.fuzz.env, ...process.env },
	});
	const out = new Response(proc.stdout);
	const err = new Response(proc.stderr);
	await proc.exited;

	if (proc.exitCode !== 0) {
		const errText = await err.text();
		if (errText.length > 0) {
			throw new GraphQLError(`Fuzzing error: ${errText}`);
		}
		throw new GraphQLError("Fuzzing error: unknown error");
	}

	const outText = await out.text();
	if (outText.length === 0) {
		throw new GraphQLError("Fuzzing error: no output");
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
export async function judgeProblem(
	root: string,
	slug: string,
	seed: string,
	input: string,
): Promise<JudgeResult> {
	const problem = await getProblemData(root, slug); // get the problem metadata
	const configPath = path.join(root, slug); // path to the problem directory (e.g. /path/to/comp/hello-world)

	const proc = Bun.spawn([...problem.judge.exec, seed], {
		cwd: configPath,
		stdin: new Response(input),
		stdout: "pipe",
		stderr: "pipe",
		env: { ...problem.judge.env, ...process.env },
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
 * Problem Markdown attributes parser
 *
 * Uses a series of regexes to parse the attributes of the markdown instructions
 *
 * @param body The markdown body
 * @param linkPrefix The prefix to add to links
 * @returns The parsed attributes
 */
export function parseMarkdownAttributes(body: string) {
	// No carriage returns
	const noCarriage = body.replaceAll("\r\n", "\n").replaceAll("\r", "\n");

	const [titleMatch, titleHead, icon, titleTail] =
		noCarriage.match(/^# (.*?)(\p{RGI_Emoji})?(.*)\n?/mv) ?? [];
	const title = ((titleHead || "") + (titleTail || ""))
		.trim()
		.replaceAll(/\s{+}/g, " ");
	let outputBody = noCarriage.trim();
	if (outputBody.length > 0) outputBody += "\n";
	return {
		title,
		icon: icon ?? "",
		body:
			titleMatch === undefined
				? outputBody
				: outputBody.replace(titleMatch, ""),
	};
}
