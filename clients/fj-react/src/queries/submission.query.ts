import type { SubmissionsQueryQueryVariables } from "@/gql";
import { client } from "@/gql/client";
import { queryOptions } from "@tanstack/react-query";

export const submissionQueryKeys = {
	root: ["submission"] as const,
	list: (vars?: SubmissionsQueryQueryVariables) =>
		[...submissionQueryKeys.root, "list", vars] as const,
	submission: (submissionId: string) => [
		...submissionQueryKeys.root,
		submissionId,
	],
	submissionDetails: (submissionId: string) => [
		...submissionQueryKeys.submission(submissionId),
		"details",
	],
};

export const submissionQueries = {
	list: (vars?: SubmissionsQueryQueryVariables) =>
		queryOptions({
			queryKey: submissionQueryKeys.list(vars),
			queryFn: () => client.SubmissionsQuery(vars),
			select: (data) => data.data.submissions,
		}),
	submission: (submissionId: string) =>
		queryOptions({
			queryKey: submissionQueryKeys.submissionDetails(submissionId),
			queryFn: () => client.SubmissionQuery({ id: submissionId }),
			select: (data) => data.data.submission,
		}),
};
