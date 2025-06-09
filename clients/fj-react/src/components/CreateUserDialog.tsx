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
import { useEffect } from "react";
import { z } from "zod";
import ControlledSelect from "./ControlledSelect";
import ControlledTextField from "./ControlledTextField";
import TeamAutocomplete from "./TeamAutocomplete";

type UserCreateDialogProps = {
	onClose: () => void;
	open: boolean;
};

const createUserSchema = z.object({
	logn: z.string().min(1, "Username is required"),
	role: z.nativeEnum(UserRole),
	team: z
		.object({
			label: z.string(),
			value: z.number(),
		})
		.optional()
		.nullable(),
});

export function CreateUserDialog(props: UserCreateDialogProps) {
	const { onClose, open } = props;

	const createUserMutation = useCreateUserMutation();

	const onSubmit: ZodSubmitHandler<typeof createUserSchema> = async (data) => {
		await createUserMutation.mutateAsync({
			role: data.role,
			username: data.logn,
			teamId: data.team?.value ?? null,
		});
		onClose();
	};

	const {
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
	} = useZodForm({
		schema: createUserSchema,
		defaultValues: {
			logn: "",
			role: UserRole.Competitor,
			team: null,
		},
	});

	useEffect(() => {
		console.log("Form errors:", errors);
	}, [errors]);

	return (
		<Dialog
			open={open}
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
						name="logn"
						label="Username"
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
					<TeamAutocomplete control={control} name="team" />
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
