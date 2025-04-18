import { TOML } from "bun";
import matter from "gray-matter";
import { z } from "zod";
import path from "path";
import { parseMarkdownAttributes } from "./problems.service";

const competitionSpec = z.object({
    times: z.object({
        start: z.coerce.date().optional(),
        finish: z.coerce.date().optional(),
        freeze: z.number()
    }),
})

export async function getCompetitionData(root: string) {
    const filePath = path.join(root, "comp.md");
  const problemFile = Bun.file(filePath);

  if (!problemFile.exists()) {
    throw new Error(`Competition file not found at ${filePath}`);
  }

  const problemFileContent = await problemFile.text();

  const { data, content } = matter(problemFileContent, {
    engines: {
      toml: TOML.parse,
    },
  });

  const problemData = await competitionSpec.safeParseAsync(data);

  if (!problemData.success) {
    throw new Error(`Problem data validation failed: ${problemData.error}`);
  }

  const attributes = parseMarkdownAttributes(content, "");

  return {
    ...problemData.data,
    attributes,
    content,
  };
}