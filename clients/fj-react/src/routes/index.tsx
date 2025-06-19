import { competitionQueries } from "@/queries/competition.query";
import { Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";

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
			<ReactMarkdown>
				{competitionQuery.data?.instructions || "No description available."}
			</ReactMarkdown>
		</>
	);
}
