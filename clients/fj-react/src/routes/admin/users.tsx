import { CreateUserDialog } from "@/components/CreateUserDialog";
import Datatable from "@/components/Datatable";
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
	columnHelper.accessor("username", {
		header: "Login",
	}),
	columnHelper.accessor("role", {
		header: "Role",
	}),
	columnHelper.accessor("teamId", {
		header: "Team Id",
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
