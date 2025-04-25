import { problemQueries } from "@/queries/problems.queries";
import { AppShell, ScrollArea } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { MantineNavLink } from "./MantineNavLink";

/**
 * Split by 1-2-3
 */

export default function ProblemSection() {
	const { data } = useQuery(problemQueries.getProblems);

	return (
		<AppShell.Section grow component={ScrollArea}>
			{data?.map((problemItem) => (
				<MantineNavLink
					to={"/problems/$problemId"}
					key={problemItem.slug}
					params={{
						problemId: problemItem.slug,
					}}
					label={problemItem.title}
					leftSection={problemItem.icon}
					activeProps={{
						active: true,
					}}
				/>
			))}
		</AppShell.Section>
	);
}
