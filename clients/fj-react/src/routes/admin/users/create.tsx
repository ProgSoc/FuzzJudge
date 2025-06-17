import ControlledSelect from "@/components/ControlledSelect";
import ControlledTextField from "@/components/ControlledTextField";
import ControlledTeamAutocomplete from "@/components/TeamAutocomplete";
import { UserRole } from "@/gql";
import useCreateUserMutation from "@/hooks/useCreateUserMutation";
import type { ZodSubmitHandler } from "@/hooks/useZodForm";
import useZodForm from "@/hooks/useZodForm";
import {
	Button,
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Stack,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/admin/users/create")({
	component: RouteComponent,
});

const createUserSchema = z.object({
	name: z.string().min(1, "Name is required"),
	username: z.string().min(1, "Username is required"),
	role: z.nativeEnum(UserRole),
	password: z.string().min(6, "Password must be at least 6 characters"),
	team: z
		.object({
			label: z.string(),
			value: z.number(),
		})
		.optional()
		.nullable(),
});

function RouteComponent() {
	const createUserMutation = useCreateUserMutation();

	const navigate = Route.useNavigate();
	const onClose = () => {
		navigate({ to: "/admin/users", replace: true });
	};

	const onSubmit: ZodSubmitHandler<typeof createUserSchema> = async (data) => {
		await createUserMutation.mutateAsync({
			role: data.role,
			username: data.username,
			teamId: data.team?.value ?? null,
			password: data.password,
			name: data.name,
		});
		onClose();
	};

	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = useZodForm({
		schema: createUserSchema,
		defaultValues: {
			username: "",
			password: "",
			role: UserRole.Competitor,
			team: null,
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
			<DialogTitle>Create User</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Please fill in the details for the new user. The username is required,
					and you can optionally assign a team.
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
						variant="outlined"
						type="password"
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
						Create User
					</Button>
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
