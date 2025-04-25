import { client } from "@/client";
import { queryOptions } from "@tanstack/react-query";

export const competitionQueryKeys = {
	all: ["competition"] as const,
	details: () => [...competitionQueryKeys.all, "details"] as const,
};

export const competitionQueries = {
	getCompetitionDetails: queryOptions({
		queryFn: () =>
			client.competition.$get().then((r) => {
				if (!r.ok) {
					throw r;
				}
				return r.json();
			}),
		queryKey: competitionQueryKeys.details(),
	}),
};
