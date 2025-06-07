import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { leaderboardQuery } from "../queries/leaderboard.query";

export const Route = createFileRoute("/leaderboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const leaderboard = useQuery(leaderboardQuery.subscription());

	return (
		<div>
			{leaderboard.data?.scoreboard.map((row, index) => (
				<div key={row.teamId}>
					<span>{index + 1}. </span>
					<span>{row.team.name} </span>
					<span>Score: </span>
					<strong>
						{row.points === null
							? "N/A"
							: row.points === undefined
								? "Loading..."
								: row.points}
					</strong>
				</div>
			))}
		</div>
	);
}
