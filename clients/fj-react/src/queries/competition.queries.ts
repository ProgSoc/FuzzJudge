import { client } from "@/client";
import { queryOptions } from "@tanstack/react-query";

export const competitionQueryKeys = {
	all: ["competition"] as const,
	details: () => [...competitionQueryKeys.all, "details"] as const,
};

export const competitionQueries = {
	getCompetitionDetails: queryOptions({
		queryFn: () => client.competition.$get().then((r) => r.json()),
		queryKey: competitionQueryKeys.details(),
	}),
};
