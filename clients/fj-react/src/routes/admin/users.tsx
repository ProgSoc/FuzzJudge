import { CreateUserDialog } from "@/components/CreateUserDialog";
import Datatable from "@/components/Datatable";
import UserRoleSelect from "@/components/UserRoleSelect";
import UserTeamSelect from "@/components/UserTeamSelect";
import type { UserListQueryQuery } from "@/gql";
import { useDisclosure } from "@/hooks/useDisclosure";
import { userQueries } from "@/queries/user.query";
import { Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";

export const Route = createFileRoute("/admin/users")({
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
	const { getButtonProps, getDisclosureProps } = useDisclosure();

	return (
		<>
			<Button {...getButtonProps()} variant="contained" color="primary">
				Create User
			</Button>
			<CreateUserDialog {...getDisclosureProps()} />
			<Datatable columns={columns} data={usersQuery.data ?? []} />
		</>
	);
}
