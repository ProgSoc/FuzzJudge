import { useTheme } from "@mui/material";
import rehypeShiki, { type RehypeShikiOptions } from "@shikijs/rehype";
import { useMemo } from "react";
import { MarkdownAsync } from "react-markdown";
import type { PluggableList } from "unified";
import remarkGfm from "remark-gfm";

// export const components: Components = {};

export default function CustomMarkdown(props: {
	children: string | null | undefined;
}) {
	const theme = useTheme();

	const rehypePlugins: PluggableList = useMemo(
		() =>
			[
				[
					rehypeShiki,
					{
						theme:
							theme.palette.mode === "light" ? "github-light" : "github-dark",
						fallbackLanguage: "text",
					} as RehypeShikiOptions,
				],
			] as PluggableList,
		[theme.palette.mode],
	);
	return (
		<MarkdownAsync
			rehypePlugins={rehypePlugins}
			remarkPlugins={[remarkGfm]}
			components={{
				pre: ({ node, ...props }) => (
					<pre
						{...props}
						style={{
							...props.style,
							overflow: "scroll",
							padding: "1rem",
						}}
					/>
				),
			}}
		>
			{props.children}
		</MarkdownAsync>
	);
}
