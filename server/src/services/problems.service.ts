import fs from "node:fs/promises";
import path from "node:path";
import { z } from "@hono/zod-openapi";
import { TOML } from "bun";
import matter from "gray-matter";
import { HTTPException } from "hono/http-exception";

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

export interface MarkdownAttributes {
	title: string;
	summary: string | undefined;
	icon: string;
	publicAssets: Set<string>;
	body: string;
}

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

export async function getProblemData(root: string, slug: string) {
	const problemFile = await Bun.file(path.join(root, slug, "prob.md"));

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

	const attributes = parseMarkdownAttributes(content, `/problems/${slug}/`);

	return {
		...problemData.data,
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

	return problems;
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
	console.log({ configPath });
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
export function parseMarkdownAttributes(body: string, linkPrefix = "") {
	// No carriage returns
	const noCarriage = body.replaceAll("\r\n", "\n").replaceAll("\r", "\n");

	const [titleMatch, titleHead, icon, titleTail] =
		noCarriage.match(/^# (.*?)(\p{RGI_Emoji})?(.*)\n?/mv) ?? [];
	const title = ((titleHead || "") + (titleTail || ""))
		.trim()
		.replaceAll(/\s{+}/g, " ");
	const summary = noCarriage.match(/^[A-Za-z].*(?:\n[A-Za-z].*)*/m)?.[0];
	const publicAssets = new Set<string>();
	let outputBody = noCarriage
		.replaceAll(/!?\[.*?\]\((.+?)\)/g, (match, link) => {
			if (link.startsWith("//") || /^\w+:/.test(link)) {
				return match;
			}
			if (linkPrefix !== "") {
				const newLink = path.normalize(`/${link}`);
				publicAssets.add(newLink);
				return match.replace(link, linkPrefix + newLink);
			}
			publicAssets.add(link);
			return match;
		})
		.trim();
	if (outputBody.length > 0) outputBody += "\n";
	return {
		title,
		summary,
		icon,
		publicAssets,
		body:
			titleMatch === undefined
				? outputBody
				: outputBody.replace(titleMatch, ""),
	};
}

export function problemToMessage(problem: Problem): FuzzJudgeProblemMessage {
	return {
		slug: problem.slug,
		doc: {
			title: problem.attributes.title,
			icon: problem.attributes.icon,
			summary: problem.attributes.summary,
			body: problem.content,
		},
		points: problem.problem.points,
		difficulty: problem.problem.difficulty,
	};
}
