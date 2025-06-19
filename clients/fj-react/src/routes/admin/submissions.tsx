import Datatable from "@/components/Datatable";
import { LinkButton } from "@/components/LinkButton";
import type { SubmissionsQueryQuery } from "@/gql";
import { submissionQueries } from "@/queries/submission.query";
import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { z } from "zod";

export const Route = createFileRoute("/admin/submissions")({
	beforeLoad: () => ({
		getTitle: () => "Submissions",
	}),
	validateSearch: z.object({
		teamId: z.coerce.number().int().optional(),
		problemSlug: z.string().optional(),
	}),
	component: RouteComponent,
});

type SubmissionRow = SubmissionsQueryQuery["submissions"][number];

const columnHelper = createColumnHelper<SubmissionRow>();

const createColumns = (teamId?: number, problemSlug?: string) => [
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
	columnHelper.display({
		id: "view",
		header: "View",
		cell: (info) => (
			<LinkButton
				to={"/admin/submissions/submission"}
				replace
				search={{ submissionId: info.row.original.id }}
				mask={{
					to: "/admin/submissions",
					unmaskOnReload: true,
					params: {
						teamId: teamId ?? undefined,
						problemSlug: problemSlug ?? undefined,
					},
				}}
			>
				View Submission
			</LinkButton>
		),
	}),
];

function RouteComponent() {
	const { teamId, problemSlug } = Route.useSearch();

	const submissionsQuery = useQuery(
		submissionQueries.list({
			teamId,
			problemSlug,
		}),
	);

	const columns = useMemo(
		() => createColumns(teamId, problemSlug),
		[teamId, problemSlug],
	);

	return (
		<>
			<Datatable columns={columns} data={submissionsQuery.data ?? []} />
			<Outlet />
		</>
	);
}
