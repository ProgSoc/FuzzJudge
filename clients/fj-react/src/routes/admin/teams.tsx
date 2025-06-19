import Datatable from "@/components/Datatable";
import { LinkButton } from "@/components/LinkButton";
import type { TeamQueryQuery } from "@/gql";
import { teamQueries } from "@/queries/team.query";
import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";

export const Route = createFileRoute("/admin/teams")({
	beforeLoad: () => ({
		getTitle: () => "Teams",
	}),
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

	return (
		<>
			<LinkButton
				to={"/admin/teams/create"}
				replace
				mask={{
					to: "/admin/teams",
					unmaskOnReload: true,
				}}
				variant="contained"
				color="primary"
			>
				Create Team
			</LinkButton>
			<Datatable columns={columns} data={teamQuery.data ?? []} />
			<Outlet />
		</>
	);
}
