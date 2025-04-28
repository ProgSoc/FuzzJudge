import { competitionQueries } from "@/queries/competition.queries";
import { AppShell, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

export default function CompetitionHeader() {
	const { data } = useQuery(competitionQueries.getCompetitionDetails);

	return (
		<AppShell.Header>
			<Title order={2} p="sm">
				{data?.title}
			</Title>
		</AppShell.Header>
	);
}
