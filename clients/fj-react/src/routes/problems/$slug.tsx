import { problemQuery } from "@/queries/problem.query";
import { Box, Divider, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import Markdown from "react-markdown";

export const Route = createFileRoute("/problems/$slug")({
	component: RouteComponent,
	loader: async ({ params, context: { queryClient } }) => {
		// ensure query
		const initialProblemData = await queryClient.ensureQueryData(
			problemQuery.problemDetails(params.slug),
		);

		return {
			initialProblemData,
		};
	},
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { initialProblemData } = Route.useLoaderData();

	const problemData = useQuery({
		...problemQuery.problemDetails(slug),
		select: (data) => data.data.problem,
		initialData: initialProblemData,
	});

	return (
		<>
			<Typography variant="h3" component="h1" gutterBottom>
				{problemData.data.name}
			</Typography>
			<Box sx={{ flexDirection: "row", display: "flex", gap: 2 }}>
				<Typography variant="subtitle2" gutterBottom>
					Points: {problemData.data.points}
				</Typography>
				<Typography variant="subtitle2" gutterBottom>
					Difficulty: {problemData.data.difficulty}
				</Typography>
			</Box>
			<Divider />
			<Markdown>{problemData.data.instructions}</Markdown>
		</>
	);
}
