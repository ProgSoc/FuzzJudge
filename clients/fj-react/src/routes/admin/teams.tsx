import Datatable from "@/components/Datatable";
import type { TeamQueryQuery } from "@/gql";
import { teamQueries } from "@/queries/team.query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";

export const Route = createFileRoute("/admin/teams")({
	component: RouteComponent,
});

type TeamRow = TeamQueryQuery["teams"][number];

const columnHelper = createColumnHelper<TeamRow>();

const columns = [
	columnHelper.accessor("name", {
		header: "Team Name",
	}),
	columnHelper.accessor("id", {
		header: "Slug",
	}),
	columnHelper.accessor("hidden", {
		header: "Hidden",
		cell: (info) => (info.getValue() ? "Yes" : "No"),
	}),
];

function RouteComponent() {
	const teamQuery = useQuery(teamQueries.list());

	return <Datatable columns={columns} data={teamQuery.data ?? []} />;
}
