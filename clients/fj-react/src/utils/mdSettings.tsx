import { Container, useTheme } from "@mui/material";
import rehypeShiki, { type RehypeShikiOptions } from "@shikijs/rehype";
import { Suspense, useMemo } from "react";
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
		<Suspense fallback={<div>Loading...</div>}>
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
					img: ({ node, ...props }) => (
						<Container>
							<img
								alt="placeholder alternative text"
								{...props}
								style={{
									maxWidth: "100%",
									height: "auto",
									display: "block",
									margin: "0 auto",
								}}
							/>
						</Container>
					),
				}}
			>
				{props.children}
			</MarkdownAsync>
		</Suspense>
	);
}
