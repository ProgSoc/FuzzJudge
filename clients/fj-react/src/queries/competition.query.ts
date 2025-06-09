import { client } from "@/gql/client";
import { queryOptions } from "@tanstack/react-query";

export const competitionQueryKeys = {
	root: ["competition"],
	details: () => [...competitionQueryKeys.root, "details"],
};

export const competitionQueries = {
	details: () =>
		queryOptions({
			queryKey: competitionQueryKeys.details(),
			queryFn: () => client.CompetitionDetailsQuery(),
		}),
};
