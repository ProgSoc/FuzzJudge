import Datatable from "@/components/Datatable";
import { LinkButton } from "@/components/LinkButton";
import UserRoleSelect from "@/components/UserRoleSelect";
import UserTeamSelect from "@/components/UserTeamSelect";
import type { UserListQueryQuery } from "@/gql";
import { useDisclosure } from "@/hooks/useDisclosure";
import { userQueries } from "@/queries/user.query";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useRef } from "react";
import Edit from "@mui/icons-material/Edit";
import { LinkMenuItem } from "@/components/LinkMenuItem";
import useDeleteUserMutation from "@/hooks/useDeleteUserMutation";

export const Route = createFileRoute("/admin/users")({
	beforeLoad: () => ({
		getTitle: () => "Users",
	}),
	component: RouteComponent,
});

type TableRow = UserListQueryQuery["users"][number];

const columnHelper = createColumnHelper<TableRow>();

interface UserEditMenuProps {
	userId: string;
}

function UserEditMenu(props: UserEditMenuProps) {
	const { getButtonProps, isOpen, onClose } = useDisclosure();
	const buttonRef = useRef<HTMLButtonElement>(null);
	const { userId } = props;

	const deleteUserMutation = useDeleteUserMutation();

	const handleDelete = useCallback(async () => {
		await deleteUserMutation.mutateAsync({ id: userId });
		onClose();
	}, [deleteUserMutation, userId, onClose]);

	return (
		<>
			<IconButton
				{...getButtonProps()}
				aria-controls={isOpen ? `user-edit-menu-${userId}` : undefined}
				aria-haspopup="true"
				aria-expanded={isOpen ? "true" : undefined}
				color="inherit"
				ref={buttonRef}
			>
				<Edit />
			</IconButton>
			<Menu
				onClose={onClose}
				open={isOpen}
				id={`user-edit-menu-${userId}`}
				anchorEl={buttonRef.current}
			>
				<LinkMenuItem
					to="/admin/users/edit"
					replace
					search={{ userId }}
					mask={{ to: "/admin/users" }}
				>
					Edit User
				</LinkMenuItem>
				<MenuItem
					onClick={handleDelete}
					disabled={deleteUserMutation.isPending}
					color="error"
				>
					Delete User
				</MenuItem>
			</Menu>
		</>
	);
}

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
	columnHelper.accessor("id", {
		id: "actions",
		header: "Actions",
		cell: (info) => <UserEditMenu userId={info.getValue()} />,
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
