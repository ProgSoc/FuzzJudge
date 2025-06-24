import ControlledTextField from "@/components/ControlledTextField";
import useCreateBroadcast from "@/hooks/useCreateBroadcast";
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

export const Route = createFileRoute("/admin/clock/broadcast")({
	component: RouteComponent,
});

const createBroadcastSchema = z.object({
	title: z.string().min(1, "Title is required"),
	content: z.string().min(1, "Content is required"),
});

function RouteComponent() {
	const createBroadcastMutation = useCreateBroadcast();
	//
	const navigate = Route.useNavigate();
	const onClose = () => {
		navigate({ to: "/admin/clock", replace: true });
	};

	const onSubmit: ZodSubmitHandler<typeof createBroadcastSchema> = async (
		data,
	) => {
		await createBroadcastMutation.mutateAsync({
			title: data.title,
			content: data.content,
		});
		onClose();
	};

	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = useZodForm({
		schema: createBroadcastSchema,
		defaultValues: {
			title: "",
			content: "",
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
			<DialogTitle>Create Broadcast</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Create a broadcast message that will be displayed to all users that
					are cuurently connected to the system.
				</DialogContentText>
				<Stack gap={2} mt={2}>
					<ControlledTextField
						control={control}
						name="title"
						label="Title"
						variant="outlined"
						fullWidth
						required
						helperText="The title of the broadcast message, will appear in the notification."
					/>
					<ControlledTextField
						control={control}
						name="content"
						label="Content"
						variant="outlined"
						fullWidth
						required
						multiline
						rows={4}
						helperText="The content of the broadcast message, will appear in the notification body. Supports Markdown formatting."
					/>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						loading={isSubmitting}
					>
						Send Broadcast
					</Button>
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
