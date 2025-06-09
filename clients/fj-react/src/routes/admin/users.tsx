import Datatable from "@/components/Datatable";
import type { UserListQueryQuery } from "@/gql";
import { userQueries } from "@/queries/user.query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";

export const Route = createFileRoute("/admin/users")({
	component: RouteComponent,
});

type TableRow = UserListQueryQuery["users"][number];

const columnHelper = createColumnHelper<TableRow>();

const columns = [
	columnHelper.accessor("logn", {
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

	return <Datatable columns={columns} data={usersQuery.data ?? []} />;
}
