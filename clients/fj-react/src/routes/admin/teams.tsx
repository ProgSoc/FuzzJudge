import Datatable from "@/components/Datatable";
import { LinkButton } from "@/components/LinkButton";
import type { TeamsQueryQuery } from "@/gql";
import { useDisclosure } from "@/hooks/useDisclosure";
import { teamQueries } from "@/queries/team.query";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useRef } from "react";
import Edit from "@mui/icons-material/Edit";
import { LinkMenuItem } from "@/components/LinkMenuItem";
import useDeleteTeamMutation from "@/hooks/useDeleteTeamMutation";

export const Route = createFileRoute("/admin/teams")({
	beforeLoad: () => ({
		getTitle: () => "Teams",
	}),
	component: RouteComponent,
});

type TeamRow = TeamsQueryQuery["teams"][number];

const columnHelper = createColumnHelper<TeamRow>();

interface TeamEditMenuProps {
	teamId: string;
}

function TeamEditMenu(props: TeamEditMenuProps) {
	const { getButtonProps, isOpen, onClose } = useDisclosure();
	const buttonRef = useRef<HTMLButtonElement>(null);
	const { teamId } = props;

	const deleteTeamMutation = useDeleteTeamMutation();

	const handleDelete = useCallback(async () => {
		await deleteTeamMutation.mutateAsync({ id: teamId });
		onClose();
	}, [deleteTeamMutation, teamId, onClose]);

	return (
		<>
			<IconButton
				{...getButtonProps()}
				aria-controls={isOpen ? `team-edit-menu-${teamId}` : undefined}
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
				id={`team-edit-menu-${teamId}`}
				anchorEl={buttonRef.current}
			>
				<LinkMenuItem
					to="/admin/teams/edit"
					replace
					search={{ teamId }}
					mask={{ to: "/admin/users" }}
				>
					Edit Team
				</LinkMenuItem>
				<MenuItem
					onClick={handleDelete}
					color="error"
					disabled={deleteTeamMutation.isPending}
				>
					Delete Team
				</MenuItem>
			</Menu>
		</>
	);
}

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
	columnHelper.accessor("id", {
		header: "Actions",
		cell: (info) => <TeamEditMenu teamId={info.getValue()} />,
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
