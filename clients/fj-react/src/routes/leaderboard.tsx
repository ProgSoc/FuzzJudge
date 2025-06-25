import Datatable from "@/components/Datatable";
import type { LeaderboardSubscriptionSubscription } from "@/gql";
import { leaderboardQueries } from "@/queries/leaderboard.query";
import { problemQuery } from "@/queries/problem.query";
import { IconButton, Paper, Tooltip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { Fragment, useEffect, useMemo } from "react";
import Done from "@mui/icons-material/Done";
import { LinkIconButton } from "@/components/LinkIconButton";

export const Route = createFileRoute("/leaderboard")({
	beforeLoad: () => ({
		getTitle: () => "Leaderboard",
	}),
	component: RouteComponent,
});

type LeaderboardRow = LeaderboardSubscriptionSubscription["scoreboard"][number];

const columnHelper = createColumnHelper<LeaderboardRow>();

function RouteComponent() {
	const leaderboardState = useQuery({
		...leaderboardQueries.leaderboardSubscription(),
		select: (data) => data.scoreboard,
	});

	const problemsQuery = useQuery(problemQuery.problemList());

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
								<LinkIconButton
									to="/problems/$slug"
									params={{ slug: problem.slug }}
								>
									{problem.icon}
								</LinkIconButton>
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
									<IconButton aria-label="solved" color="success">
										<Done />
									</IconButton>
								) : (
									<Fragment />
								)}
							</Tooltip>
						),
					},
				),
			) ?? [];

		return [
			columnHelper.accessor("rank", {
				id: "rank",
				header: "Rank",
				cell: (info) => info.getValue(),
				size: 100,
				maxSize: 100,
			}),
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
			data={leaderboardState.data ?? []}
		/>
	);
}
