import { problemQuery } from "@/queries/problem.query";
import { List, ListItemText } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { LinkListItemButton } from "./LinkListItemButton";

export default function ProblemList() {
	const problemsQuery = useQuery(problemQuery.problemList());

	return (
		<List component="div" disablePadding>
			{problemsQuery.data?.map((problem) => (
				<LinkListItemButton
					key={problem.slug}
					to={"/problems/$slug"}
					params={{ slug: problem.slug }}
					activeProps={{
						selected: true,
					}}
					sx={{ pl: 4 }}
				>
					<ListItemText
						primary={problem.solved ? `✅ ${problem.name}` : problem.name}
						secondary={`${problem.icon} Points: ${problem.points}`}
					/>
				</LinkListItemButton>
			))}
		</List>
	);
}
