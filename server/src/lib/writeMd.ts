/**
 * Goal for this file:
 * * Read a markdown file from the filesystem with it's frontmatter
 * * Parse the frontmatter using zod and gray-matter
 * * Take in a data object that partially matches the frontmatter schema
 * * Write the markdown file to the filesystem with the language and frontmatter intact
 */

import {
	competitionSpec,
	type timesSpec,
} from "@/services/competition.service";
import matter from "gray-matter";
import * as TOML from "smol-toml";
import yaml from "yaml";
import type { z } from "zod";

export async function readMarkdown<TSchema extends z.AnyZodObject>(
	filePath: string,
	frontmatterSchema: TSchema,
) {
	const markdownFile = Bun.file(filePath);

	if (!markdownFile.exists()) {
		throw new Error(`Competition file not found at ${filePath}`);
	}

	const problemFileContent = await markdownFile.text();

	const { data, content, language } = matter(problemFileContent, {
		engines: {
			toml: TOML,
			yaml: yaml,
		},
	});

	const frontmatterData = await frontmatterSchema.safeParseAsync(data);

	if (!frontmatterData.success) {
		throw new Error(
			`Invalid frontmatter data (read): ${frontmatterData.error.message}`,
		);
	}

	return {
		content,
		frontmatter: frontmatterData.data as z.infer<TSchema>,
		language,
	};
}

export async function writeCompetitionTimes(
	filePath: string,
	data: Partial<z.infer<typeof timesSpec>>,
) {
	const { content, frontmatter, language } = await readMarkdown(
		filePath,
		competitionSpec,
	);

	const newFrontmatter: z.infer<typeof competitionSpec> = {
		...frontmatter,
		times: {
			...frontmatter.times,
			...data,
		},
	};

	const frontmatterString = matter.stringify(content, newFrontmatter, {
		language: language,
		engines: {
			toml: TOML,
			yaml: yaml,
		},
	});

	// replace the first line with the frontmatter string `---${language}\n`
	const frontmatterLines = frontmatterString.split("\n");
	frontmatterLines[0] = `---${language}`;
	const frontmatterStringWithLanguage = frontmatterLines.join("\n");

	await Bun.write(filePath, frontmatterStringWithLanguage);

	return newFrontmatter.times;
}
