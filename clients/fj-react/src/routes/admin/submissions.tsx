import Datatable from "@/components/Datatable";
import type { SubmissionsQueryQuery } from "@/gql";
import { submissionQueries } from "@/queries/submission.query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";

export const Route = createFileRoute("/admin/submissions")({
	component: RouteComponent,
});

type SubmissionRow = SubmissionsQueryQuery["submissions"][number];

const columnHelper = createColumnHelper<SubmissionRow>();

const columns = [
	columnHelper.accessor("id", {
		header: "Submission ID",
	}),
	columnHelper.accessor("teamId", {
		header: "Team ID",
	}),
	columnHelper.accessor("problemSlug", {
		header: "Problem Slug",
	}),
	columnHelper.accessor("ok", {
		header: "Status",
		cell: (info) => (info.getValue() ? "Solved" : "Incorrect"),
	}),
];

function RouteComponent() {
	const submissionsQuery = useQuery(submissionQueries.list());
	return <Datatable columns={columns} data={submissionsQuery.data ?? []} />;
}
