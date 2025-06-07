import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import {
	LeaderboardSubscriptionDocument,
	type LeaderboardSubscriptionSubscription,
} from "../gql";
import { wsClient } from "../gql/client";
import {
	leaderboardQuery,
	leaderboardQueryKeys,
} from "../queries/leaderboard.query";

export const Route = createFileRoute("/leaderboard")({
	component: RouteComponent,
});

const useLeaderboard = () => {
	const queryClient = useQueryClient();

	useEffect(() => {
		const unsubscribe = wsClient.subscribe<LeaderboardSubscriptionSubscription>(
			{
				query: LeaderboardSubscriptionDocument,
			},
			{
				error: (error) => {
					console.error("Error in leaderboard subscription:", error);
					queryClient.setQueryData(leaderboardQueryKeys.subscription(), []); // Clear data on error
				},
				next: ({ data }) => {
					if (data?.scoreboard === undefined) {
						console.warn("Received undefined scoreboard data");
						return;
					}

					queryClient.setQueryData(
						leaderboardQueryKeys.subscription(),
						data.scoreboard,
					);
				},
				complete: () => {},
			},
		);

		return () => {
			unsubscribe();
		};
	}, [queryClient]);

	return useQuery(leaderboardQuery.subscription());
};

function RouteComponent() {
	const leaderboard = useLeaderboard();

	return (
		<div>
			{leaderboard.data?.map((row, index) => (
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
