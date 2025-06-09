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
			queryFn: () => client.TeamQuery(),
			select: (data) => data.data.teams,
		}),
};
