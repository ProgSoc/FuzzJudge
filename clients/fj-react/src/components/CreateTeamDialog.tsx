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
import { useEffect } from "react";
import { z } from "zod";
import ControlledCheckbox from "./ControlledCheckbox";
import ControlledTextField from "./ControlledTextField";

type TeamCreateDialogProps = {
	onClose: () => void;
	open: boolean;
};

const createTeamSchema = z.object({
	name: z.string().min(1, "Team name is required"),
	hidden: z.boolean().default(false),
});

export function CreateTeamDialog(props: TeamCreateDialogProps) {
	const { onClose, open } = props;

	const createTeamMutation = useCreateTeamMutation();

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
		formState: { errors, isSubmitting },
	} = useZodForm({
		schema: createTeamSchema,
		defaultValues: {
			hidden: false,
			name: "",
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
