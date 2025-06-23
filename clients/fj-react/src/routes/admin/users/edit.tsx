import ControlledSelect from "@/components/ControlledSelect";
import ControlledTextField from "@/components/ControlledTextField";
import ControlledTeamAutocomplete from "@/components/TeamAutocomplete";
import { UserRole } from "@/gql";
import useUpdateUserMutation from "@/hooks/useUpdateUserMutation";
import type { ZodSubmitHandler } from "@/hooks/useZodForm";
import useZodForm from "@/hooks/useZodForm";
import { userQueries } from "@/queries/user.query";
import {
	Button,
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Stack,
} from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/admin/users/edit")({
	validateSearch: z.object({
		userId: z.coerce.number(),
	}),
	pendingComponent: PendingComponent,
	component: RouteComponent,
});

function PendingComponent() {
	return null;
}

const editUserSchema = z.object({
	name: z.string().min(1, "Name is required"),
	username: z.string().min(1, "Username is required"),
	role: z.nativeEnum(UserRole),
	password: z.string().optional(),
	team: z
		.object({
			label: z.string(),
			value: z.number(),
		})
		.optional()
		.nullable(),
});

function RouteComponent() {
	const userId = Route.useSearch({
		select: (params) => params.userId,
	});

	const userQuery = useSuspenseQuery(userQueries.detail(userId));

	const updateUserMutation = useUpdateUserMutation();

	const navigate = Route.useNavigate();
	const onClose = () => {
		navigate({ to: "/admin/users", replace: true });
	};

	const onSubmit: ZodSubmitHandler<typeof editUserSchema> = async (data) => {
		await updateUserMutation.mutateAsync({
			userId,
			role: data.role,
			username: data.username,
			password: data.password === "" ? undefined : data.password,
			teamId: data.team?.value ?? null,
			name: data.name,
		});
		onClose();
	};

	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = useZodForm({
		schema: editUserSchema,
		defaultValues: {
			name: userQuery.data.name,
			username: userQuery.data.username,
			password: "",
			role: userQuery.data.role,
			team: userQuery.data.team
				? {
						label: userQuery.data.team.name,
						value: userQuery.data.team.id,
					}
				: null,
		},
	});

	return (
		<Dialog
			open
			onClose={onClose}
			maxWidth="md"
			component={"form"}
			onSubmit={handleSubmit(onSubmit)}
		>
			<DialogTitle>Edit User</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Please fill in the details for the user you want to edit.
				</DialogContentText>
				<Stack gap={2} mt={2}>
					<ControlledTextField
						control={control}
						name="name"
						label="Name"
						variant="outlined"
						fullWidth
						required
					/>
					<ControlledTextField
						control={control}
						name="username"
						label="Username"
						variant="outlined"
						fullWidth
						required
					/>
					<ControlledTextField
						control={control}
						name="password"
						label="Password"
						type="password"
						autoComplete="new-password"
						variant="outlined"
						fullWidth
						required
					/>
					<ControlledSelect
						control={control}
						name="role"
						label="Role"
						variant="outlined"
						fullWidth
						options={[
							{ label: "Admin", value: UserRole.Admin },
							{ label: "Competitor", value: UserRole.Competitor },
						]}
					/>
					<ControlledTeamAutocomplete control={control} name="team" />
					<Button
						type="submit"
						variant="contained"
						color="primary"
						loading={isSubmitting}
					>
						Save
					</Button>
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
