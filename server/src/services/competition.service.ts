import path from "node:path";
import { z } from "zod";
import { readMarkdown } from "../lib/writeMd";
import { parseMarkdownAttributes } from "./problems.service";

export const timesSpec = z.object({
	start: z.coerce.date(),
	finish: z.coerce.date(),
	hold: z.coerce.date().nullable().optional(), // Whether the competition is currently on hold
	isReleased: z.boolean().optional(), // Whether the final scoreboard is released (only relevant after the competition ends)
	freeze: z.number(), // The number of minutes before the end of the competition when the scoreboard is frozen
});

const partialTimeSpec = timesSpec.partial();
export type PartialTimes = z.infer<typeof partialTimeSpec>;

export type Times = z.infer<typeof timesSpec>;

export const competitionSpec = z.object({
	server: z
		.object({
			// origins: z.array(z.string()).optional(),
			public: z.array(z.string()).optional(),
		})
		.optional(),
	times: timesSpec,
});

export type CompetitionSpec = z.infer<typeof competitionSpec>;

export async function getCompetitionData(root: string) {
	const filePath = path.join(root, "comp.md");
	const { content, frontmatter } = await readMarkdown(
		filePath,
		competitionSpec,
	);

	const attributes = parseMarkdownAttributes(content);

	return {
		...frontmatter,
		attributes,
		content,
	};
}
