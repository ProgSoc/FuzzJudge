import { Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { competitionQueries } from "@/queries/competition.query";
import CustomMarkdown from "@/utils/mdSettings";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const competitionQuery = useQuery(competitionQueries.details());

	return (
		<>
			<Typography variant="h3" component="h1" gutterBottom>
				{competitionQuery.data?.name
					? `Welcome to ${competitionQuery.data.name}!`
					: "Welcome to the Competition!"}
			</Typography>
			<CustomMarkdown>
				{competitionQuery.data?.instructions || "No description available."}
			</CustomMarkdown>
		</>
	);
}
