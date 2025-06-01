/**
 * Goal for this file:
 * * Read a markdown file from the filesystem with it's frontmatter
 * * Parse the frontmatter using zod and gray-matter
 * * Take in a data object that partially matches the frontmatter schema
 * * Write the markdown file to the filesystem with the language and frontmatter intact
 */

import matter from "gray-matter";
import * as TOML from "smol-toml";
import yaml from "yaml";
import type { z } from "zod";

type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

export function isObject(item: unknown): item is Record<string, unknown> {
	return item !== null && typeof item === "object" && !Array.isArray(item);
}

export default function mergeDeep(
	target: Record<string, unknown>,
	source: Record<string, unknown>,
): Record<string, unknown> {
	const output = Object.assign({}, target);
	if (isObject(target) && isObject(source)) {
		for (const key of Object.keys(source)) {
			if (isObject(source[key])) {
				if (!(key in target)) Object.assign(output, { [key]: source[key] });
				else
					output[key] = mergeDeep(
						target[key] as Record<string, unknown>,
						source[key] as Record<string, unknown>,
					);
			} else {
				Object.assign(output, { [key]: source[key] });
			}
		}
	}
	return output;
}

export async function readMarkdown<TSchema extends z.AnyZodObject>(
	filePath: string,
	frontmatterSchema: TSchema,
): Promise<{
	content: string;
	frontmatter: z.infer<TSchema>;
}> {
	const markdownFile = Bun.file(filePath);

	if (!markdownFile.exists()) {
		throw new Error(`Competition file not found at ${filePath}`);
	}

	const problemFileContent = await markdownFile.text();

	const { data, content } = matter(problemFileContent, {
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
		frontmatter: frontmatterData.data,
	};
}

export async function writeFrontmatter<TSchema extends z.AnyZodObject>(
	filePath: string,
	frontmatterSchema: TSchema,
	data: DeepPartial<z.infer<TSchema>>,
) {
	const markdownFile = Bun.file(filePath);

	if (!markdownFile.exists()) {
		throw new Error(`Competition file not found at ${filePath}`);
	}

	const problemFileContent = await markdownFile.text();

	const {
		data: originalFrontmatter,
		content,
		language,
	} = matter(problemFileContent, {
		engines: {
			toml: TOML,
			yaml: yaml,
		},
	});

	const frontmatterString = matter.stringify(
		content,
		mergeDeep(originalFrontmatter, data),
		{
			language: language,
			engines: {
				toml: TOML,
				yaml: yaml,
			},
		},
	);

	// replace the first line with the frontmatter string `---${language}\n`
	const frontmatterLines = frontmatterString.split("\n");
	frontmatterLines[0] = `---${language}`;
	const frontmatterStringWithLanguage = frontmatterLines.join("\n");

	await Bun.write(filePath, frontmatterStringWithLanguage);
}
