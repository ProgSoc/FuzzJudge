import { client } from "@/gql/client";
import { queryOptions } from "@tanstack/react-query";

export const problemQueryKeys = {
	root: ["problems"],
	problem: (slug: string) => [...problemQueryKeys.root, slug],
	problemDetails: (slug: string) => [
		...problemQueryKeys.problem(slug),
		"details",
	],
	list: () => [...problemQueryKeys.root, "list"],
};

export const problemQuery = {
	problemDetails: (slug: string) =>
		queryOptions({
			queryKey: problemQueryKeys.problemDetails(slug),
			queryFn: () => client.ProblemDetailsQuery({ slug }),
			select: (data) => data.data.problem,
		}),
	problemList: () =>
		queryOptions({
			queryKey: problemQueryKeys.list(),
			queryFn: () => client.ProblemListQuery(),
			select: (data) => data.data.problems,
		}),
	teamProblemFuzz: (slug: string, teamId: string) =>
		queryOptions({
			queryKey: [...problemQueryKeys.problem(slug), "fuzz", teamId],
			queryFn: () => client.TeamProblemFuzz({ slug, teamId }),
			select: (data) => data.data.problem.fuzz,
		}),
};
