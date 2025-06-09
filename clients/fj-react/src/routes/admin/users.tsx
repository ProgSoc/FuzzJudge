import ControlledAutocomplete from "@/components/ControlledAutocomplete";
import ControlledSelect from "@/components/ControlledSelect";
import ControlledTextField from "@/components/ControlledTextField";
import { CreateUserDialog } from "@/components/CreateUserDialog";
import Datatable from "@/components/Datatable";
import TeamAutocomplete from "@/components/TeamAutocomplete";
import { type UserListQueryQuery, UserRole } from "@/gql";
import useCreateUserMutation from "@/hooks/useCreateUserMutation";
import { useDisclosure } from "@/hooks/useDisclosure";
import type { ZodSubmitHandler } from "@/hooks/useZodForm";
import useZodForm from "@/hooks/useZodForm";
import { teamQueries } from "@/queries/team.query";
import { userQueries } from "@/queries/user.query";
import {
	Button,
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Stack,
} from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useMemo } from "react";
import type {
	FieldPath,
	FieldValues,
	UseControllerProps,
} from "react-hook-form";
import { useDebounceValue } from "usehooks-ts";
import { z } from "zod";

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
