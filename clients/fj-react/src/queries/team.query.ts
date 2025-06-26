import { client } from "@/gql/client";
import { queryOptions } from "@tanstack/react-query";

export const teamQueryKeys = {
	root: ["team"],
	list: () => [...teamQueryKeys.root, "list"],
	detail: (teamId: string) => [...teamQueryKeys.root, "detail", teamId],
};

export const teamQueries = {
	list: () =>
		queryOptions({
			queryKey: teamQueryKeys.list(),
			queryFn: () => client.TeamsQuery(),
			select: (data) => data.data.teams,
		}),
	detail: (teamId: string) =>
		queryOptions({
			queryKey: teamQueryKeys.detail(teamId),
			queryFn: () => client.TeamQuery({ teamId }),
			select: (data) => data.data.team,
		}),
};
