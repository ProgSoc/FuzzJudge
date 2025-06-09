import { client } from "@/gql/client";
import { queryOptions } from "@tanstack/react-query";

export const submissionQueryKeys = {
	root: ["submission"],
	list: () => [...submissionQueryKeys.root, "list"],
};

export const submissionQueries = {
	list: () =>
		queryOptions({
			queryKey: submissionQueryKeys.list(),
			queryFn: () => client.SubmissionsQuery(),
			select: (data) => data.data.submissions,
		}),
};
