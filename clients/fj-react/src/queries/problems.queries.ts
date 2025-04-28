import { client } from "@/client";
import { queryOptions } from "@tanstack/react-query";

export const problemQueryKeys = {
	all: ["problems"] as const,
	list: () => [...problemQueryKeys.all, "list"] as const,
	problem: (slug: string) =>
		[...problemQueryKeys.all, "problem", slug] as const,
	problemDetail: (slug: string) =>
		[...problemQueryKeys.problem(slug), "detail"] as const,
};

export const problemQueries = {
	getProblems: queryOptions({
		queryFn: () =>
			client.problems.$get().then((r) => {
				if (!r.ok) {
					throw r;
				}
				return r.json();
			}),
		queryKey: problemQueryKeys.list(),
	}),
	getProblem: (id: string) =>
		queryOptions({
			queryFn: () =>
				client.problems[":id"]
					.$get({
						param: {
							id,
						},
					})
					.then((r) => {
						if (!r.ok) {
							throw r;
						}
						return r.json();
					}),
			queryKey: problemQueryKeys.problemDetail(id),
		}),
};
