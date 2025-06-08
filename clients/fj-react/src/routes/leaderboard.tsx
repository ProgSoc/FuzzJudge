import { problemQuery } from "@/queries/problem.query";
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { leaderboardQuery } from "../queries/leaderboard.query";

export const Route = createFileRoute("/leaderboard")({
	component: RouteComponent,
});

type LeaderboardRow = {
	__typename?: "ScoreboardRow";
	points: number;
	penalty: number;
	teamId: number;
	team: {
		__typename?: "Team";
		name: string;
	};
	problems: Array<{
		__typename?: "ProblemScore";
		solved: boolean;
		slug: string;
	}>;
};

const columnHelper = createColumnHelper<LeaderboardRow>();

function RouteComponent() {
	const leaderboard = useQuery({
		...leaderboardQuery.subscription(),
		select: (data) => data?.scoreboard,
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
						const problemScore = row.problems.find(
							(p) => p.slug === problem.slug,
						);
						return problemScore ? problemScore.solved : false;
					},
					{
						id: problem.slug,
						header: () => problem.name,
						cell: (info) => (info.getValue() ? "✔️" : "❌"),
					},
				),
			) ?? [];

		return [
			columnHelper.accessor("team.name", {
				id: "teamName",
				header: "Team Name",
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor("points", {
				id: "points",
				header: "Points",
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor("penalty", {
				id: "penalty",
				header: "Penalty",
				cell: (info) => info.getValue(),
			}),
			...problemColumns,
		];
	}, [problemsQuery.data]);

	const table = useReactTable({
		data: leaderboard.data ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableCell key={header.id} colSpan={header.colSpan}>
										{header.isPlaceholder ? null : (
											<div>
												{flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
											</div>
										)}
									</TableCell>
								);
							})}
						</TableRow>
					))}
				</TableHead>
				<TableBody>
					{table.getRowModel().rows.map((row) => {
						return (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => {
									return (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									);
								})}
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
