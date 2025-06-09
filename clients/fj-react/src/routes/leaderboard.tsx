import Datatable from "@/components/Datatable";
import { LinkButton } from "@/components/LinkButton";
import {
	LeaderboardSubscriptionDocument,
	type LeaderboardSubscriptionSubscription,
} from "@/gql";
import useSubscription from "@/hooks/useSubscription";
import { problemQuery } from "@/queries/problem.query";
import { Paper, Tooltip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useMemo } from "react";

export const Route = createFileRoute("/leaderboard")({
	component: RouteComponent,
});

type LeaderboardRow = LeaderboardSubscriptionSubscription["scoreboard"][number];

const columnHelper = createColumnHelper<LeaderboardRow>();

const selectScoreboard = (data: LeaderboardSubscriptionSubscription) =>
	data.scoreboard;

function RouteComponent() {
	const leaderboardState = useSubscription({
		query: LeaderboardSubscriptionDocument,
		select: selectScoreboard,
	});

	const problemsQuery = useQuery({
		...problemQuery.problemList(),
		select: (data) => data.data.problems,
	});

	const columns = useMemo(() => {
		// Each question is a column along with rank and team name
		const problemColumns =
			problemsQuery.data?.map((problem) =>
				columnHelper.accessor(
					(row) => {
						const value = row.problems.find((p) => p.slug === problem.slug);
						return value?.solved ?? false;
					},
					{
						id: problem.slug,
						header: () => (
							<Tooltip title={problem.name}>
								<LinkButton
									to="/problems/$slug"
									params={{ slug: problem.slug }}
								>
									{problem.icon}
								</LinkButton>
							</Tooltip>
						),
						cell: (info) => (
							<Tooltip
								title={
									info.getValue() ? "Problem solved" : "Problem not solved"
								}
							>
								{info.getValue() ? (
									// Checkmark emoji for solved problems
									<span role="img" aria-label="checkmark">
										✅
									</span>
								) : (
									// Cross emoji for unsolved problems
									<span role="img" aria-label="cross">
										❌
									</span>
								)}
							</Tooltip>
						),
					},
				),
			) ?? [];

		return [
			columnHelper.accessor("team.name", {
				id: "teamName",
				header: "Team Name",
				cell: (info) => info.getValue(),
				size: 200,
				maxSize: 200,
			}),
			columnHelper.accessor("points", {
				id: "points",
				header: "Points",
				cell: (info) => info.getValue(),
				size: 100,
				maxSize: 100,
			}),
			columnHelper.accessor("penalty", {
				id: "penalty",
				header: "Penalty",
				cell: (info) => info.getValue(),
				size: 100,
				maxSize: 100,
			}),

			...problemColumns,
		];
	}, [problemsQuery.data]);

	useEffect(() => {
		console.log("Columns changed", columns);
	}, [columns]);

	return (
		<Datatable
			component={Paper}
			columns={columns}
			data={leaderboardState ?? []}
		/>
	);
}
