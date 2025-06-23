import { problemQuery } from "@/queries/problem.query";
import { List, ListItemText, ListSubheader } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { LinkListItemButton } from "./LinkListItemButton";
import { Fragment, useMemo } from "react";
import difficultyToLabel from "@/utils/difficultyToLabel";

export default function ProblemList() {
	const problemsQuery = useQuery(problemQuery.problemList());

	const splitProblems = useMemo(() => {
		// I need to add a label before each group of problems so I need to split the problems into their difficulties (1-3)

		if (!problemsQuery.data) return [];

		const problemsByDifficulty = problemsQuery.data.reduce(
			(acc, problem) => {
				const { difficulty } = problem;
				if (!acc[difficulty]) {
					acc[difficulty] = [];
				}
				acc[difficulty].push(problem);
				return acc;
			},
			{} as Record<number, typeof problemsQuery.data>,
		);

		return Object.entries(problemsByDifficulty).map(
			([difficulty, problems]) => ({
				difficulty: Number.parseInt(difficulty),
				problems,
			}),
		);
	}, [problemsQuery.data]);

	return (
		<List component="div" disablePadding>
			{splitProblems.map(({ difficulty, problems }) => (
				<Fragment key={`${difficulty}-section`}>
					<ListSubheader
						key={`${difficulty}-label`}
						sx={{
							pl: 4,
						}}
					>
						{difficultyToLabel(difficulty)}
					</ListSubheader>
					{problems.map((problem) => (
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
				</Fragment>
			))}
		</List>
	);
}
