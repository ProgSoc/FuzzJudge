import ControlledCheckbox from "@/components/ControlledCheckbox";
import ControlledTextField from "@/components/ControlledTextField";
import useUpdateTeam from "@/hooks/useUpdateTeamMutation";
import type { ZodSubmitHandler } from "@/hooks/useZodForm";
import useZodForm from "@/hooks/useZodForm";
import { teamQueries } from "@/queries/team.query";
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

export const Route = createFileRoute("/admin/teams/edit")({
	validateSearch: z.object({
		teamId: z.string(),
	}),
	pendingComponent: PendingComponent,
	component: RouteComponent,
});

function PendingComponent() {
	return null;
}

const editTeamScheme = z.object({
	name: z.string().min(1, "Name is required"),
	hidden: z.boolean(),
});

function RouteComponent() {
	const teamId = Route.useSearch({
		select: (params) => params.teamId,
	});

	const userQuery = useSuspenseQuery(teamQueries.detail(teamId));

	const updateTeamMutation = useUpdateTeam();

	const navigate = Route.useNavigate();
	const onClose = () => {
		navigate({ to: "/admin/teams", replace: true });
	};

	const onSubmit: ZodSubmitHandler<typeof editTeamScheme> = async (data) => {
		await updateTeamMutation.mutateAsync({
			teamId: teamId,
			hidden: data.hidden,
			name: data.name,
		});
		onClose();
	};

	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = useZodForm({
		schema: editTeamScheme,
		defaultValues: {
			name: userQuery.data.name,
			hidden: userQuery.data.hidden,
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
					Please fill in the details for the team.
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
					<ControlledCheckbox control={control} name="hidden" label="Hidden" />
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
