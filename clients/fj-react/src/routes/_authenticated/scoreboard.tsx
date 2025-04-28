import { scoreboardQueries } from "@/queries/scoreboard.queries";
import { Table } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/scoreboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const scoreboardQuery = useQuery({
		...scoreboardQueries.getScoreboard(),
		placeholderData: keepPreviousData,
		initialData: [],
	});

	const rows = scoreboardQuery.data.map((team) => (
		<Table.Tr key={team.name}>
			<Table.Td>{team.rank}</Table.Td>
			<Table.Td>{team.name}</Table.Td>
			<Table.Td>
				{team.problems
					.map((problem) => (problem.solved ? "✔️" : "❌"))
					.join(", ")}
			</Table.Td>

			<Table.Td>{team.points}</Table.Td>
		</Table.Tr>
	));

	if (scoreboardQuery.isLoading) {
		return <div>Loading...</div>;
	}
	if (scoreboardQuery.isError) {
		return <div>Error: {scoreboardQuery.error.message}</div>;
	}

	return (
		<Table>
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Rank</Table.Th>
					<Table.Th>Name</Table.Th>
					<Table.Th>Problems</Table.Th>
					<Table.Th>Points</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>{rows}</Table.Tbody>
		</Table>
	);
}
