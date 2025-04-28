import { scoreboardQueries } from "@/queries/scoreboard.queries";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/scoreboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const scoreboardQuery = useQuery(scoreboardQueries.getScoreboard());

	return (
		<div>
			<h1>Scoreboard</h1>
			{scoreboardQuery.isLoading && <p>Loading...</p>}
			{scoreboardQuery.isError && <p>Error: {scoreboardQuery.error.message}</p>}
			{scoreboardQuery.isSuccess && (
				<ul>
					{scoreboardQuery.data.map((team) => (
						<li key={team.name}>
							{team.rank} - {team.name} - {team.points} points - {team.penalty}{" "}
							penalty
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
