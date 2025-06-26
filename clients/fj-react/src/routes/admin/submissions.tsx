import Datatable from "@/components/Datatable";
import { LinkButton } from "@/components/LinkButton";
import type { SubmissionsQueryQuery } from "@/gql";
import { problemQuery } from "@/queries/problem.query";
import { submissionQueries } from "@/queries/submission.query";
import { teamQueries } from "@/queries/team.query";
import { MenuItem, Stack, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
	Outlet,
	createFileRoute,
	stripSearchParams,
} from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { z } from "zod";
import { fallback } from "@tanstack/zod-adapter";

export const Route = createFileRoute("/admin/submissions")({
	beforeLoad: () => ({
		getTitle: () => "Submissions",
	}),
	validateSearch: z.object({
		teamId: fallback(z.string().optional(), undefined),
		problemSlug: fallback(z.string().optional(), undefined),
	}),
	search: {
		middlewares: [
			stripSearchParams({
				problemSlug: "",
			}),
		],
	},
	component: RouteComponent,
});

type SubmissionRow = SubmissionsQueryQuery["submissions"][number];

const columnHelper = createColumnHelper<SubmissionRow>();

const createColumns = (teamId?: string, problemSlug?: string) => [
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

function TeamSelect() {
	const teamId = Route.useSearch({ select: (s) => s.teamId });

	const teamsQuery = useQuery(teamQueries.list());

	const navigate = Route.useNavigate();

	return (
		<TextField
			select
			label="Team"
			value={teamId ?? ""}
			helperText="Select a team to filter submissions"
			onChange={(e) => {
				try {
					const newTeamId = e.target.value !== "" ? e.target.value : undefined;

					navigate({
						search: (prev) => ({
							...prev,
							teamId: newTeamId,
						}),
					});
				} catch (error) {
					console.error("Error parsing team ID:", error);
				}
			}}
		>
			<MenuItem value="">
				<em>All Teams</em>
			</MenuItem>
			{teamsQuery.data?.map((team) => (
				<MenuItem key={team.id} value={team.id}>
					{team.name}
				</MenuItem>
			))}
		</TextField>
	);
}

function ProblemSelect() {
	const problemSlug = Route.useSearch({ select: (s) => s.problemSlug });
	const problemsQuery = useQuery(problemQuery.problemList());
	const navigate = Route.useNavigate();

	return (
		<TextField
			select
			label="Problem"
			value={problemSlug ?? ""}
			helperText="Select a problem to filter submissions"
			onChange={(e) => {
				const newProblemSlug = e.target.value || undefined;

				navigate({
					search: (prev) => ({
						...prev,
						problemSlug: newProblemSlug !== "" ? newProblemSlug : undefined,
					}),
				});
			}}
		>
			<MenuItem value="">
				<em>All Problems</em>
			</MenuItem>
			{problemsQuery.data?.map((problem) => (
				<MenuItem key={problem.slug} value={problem.slug}>
					{problem.name}
				</MenuItem>
			))}
		</TextField>
	);
}

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
			<Stack direction="row" spacing={2} mb={2}>
				<TeamSelect />
				<ProblemSelect />
			</Stack>
			<Datatable columns={columns} data={submissionsQuery.data ?? []} />
			<Outlet />
		</>
	);
}
