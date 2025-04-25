import { competitionQueries } from "@/queries/competition.queries";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const { data } = useQuery(competitionQueries.getCompetitionDetails);

	return (
		<div className="text-center">{JSON.stringify(data, undefined, 2)}</div>
	);
}
