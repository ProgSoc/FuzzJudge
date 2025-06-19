import Datatable from "@/components/Datatable";
import { LinkButton } from "@/components/LinkButton";
import UserRoleSelect from "@/components/UserRoleSelect";
import UserTeamSelect from "@/components/UserTeamSelect";
import type { UserListQueryQuery } from "@/gql";
import { userQueries } from "@/queries/user.query";
import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";

export const Route = createFileRoute("/admin/users")({
	beforeLoad: () => ({
		getTitle: () => "Users",
	}),
	component: RouteComponent,
});

type TableRow = UserListQueryQuery["users"][number];

const columnHelper = createColumnHelper<TableRow>();

const columns = [
	columnHelper.accessor("name", {
		header: "Name",
	}),
	columnHelper.accessor("username", {
		header: "Username",
	}),
	columnHelper.accessor("role", {
		header: "Role",
		cell: (info) => (
			<UserRoleSelect
				role={info.getValue()}
				userId={info.row.original.id}
				key={info.getValue()}
			/>
		),
	}),
	columnHelper.accessor("team", {
		header: "Team",
		cell: (info) => (
			<UserTeamSelect
				team={info.getValue() ?? null}
				userId={info.row.original.id}
				key={info.getValue()?.id}
			/>
		),
	}),
];

function RouteComponent() {
	const usersQuery = useQuery(userQueries.userList());

	return (
		<>
			<LinkButton
				to="/admin/users/create"
				replace
				mask={{
					to: "/admin/users",
					unmaskOnReload: true,
				}}
				variant="contained"
				color="primary"
			>
				Create User
			</LinkButton>

			<Datatable columns={columns} data={usersQuery.data ?? []} />
			<Outlet />
		</>
	);
}
