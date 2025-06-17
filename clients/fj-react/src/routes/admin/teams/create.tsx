import ControlledCheckbox from "@/components/ControlledCheckbox";
import ControlledTextField from "@/components/ControlledTextField";
import useCreateTeamMutation from "@/hooks/useCreateTeamMutation";
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

export const Route = createFileRoute("/admin/teams/create")({
	component: RouteComponent,
});

const createTeamSchema = z.object({
	name: z.string().min(1, "Team name is required"),
	hidden: z.boolean().default(false),
});

function RouteComponent() {
	const createTeamMutation = useCreateTeamMutation();
	const navigate = Route.useNavigate();

	const onClose = () => {
		navigate({ to: "/admin/teams", replace: true });
	};

	const onSubmit: ZodSubmitHandler<typeof createTeamSchema> = async (data) => {
		await createTeamMutation.mutateAsync({
			name: data.name,
			hidden: data.hidden,
		});
		onClose();
	};

	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = useZodForm({
		schema: createTeamSchema,
		defaultValues: {
			hidden: false,
			name: "",
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
			<DialogTitle>Create Team</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Please fill in the details for the new team. The team name is
					required.
				</DialogContentText>
				<Stack gap={2} mt={2}>
					<ControlledTextField
						control={control}
						name="name"
						label="Username"
						variant="outlined"
						fullWidth
						required
					/>
					<ControlledCheckbox label="Hidden" name="hidden" control={control} />
					<Button
						type="submit"
						variant="contained"
						color="primary"
						loading={isSubmitting}
					>
						Create Team
					</Button>
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
