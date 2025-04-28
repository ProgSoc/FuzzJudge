import { client } from "@/client";
import { queryOptions } from "@tanstack/react-query";

export const scoreboardQueryKeys = {
	all: ["scoreboard"] as const,
	detail: () => [...scoreboardQueryKeys.all, "detail"] as const,
};

export const scoreboardQueries = {
	getScoreboard: () =>
		queryOptions({
			queryFn: () =>
				client.scoreboard.$get().then((r) => {
					if (!r.ok) {
						throw r;
					}
					return r.json();
				}),
			queryKey: scoreboardQueryKeys.detail(),
		}),
};
