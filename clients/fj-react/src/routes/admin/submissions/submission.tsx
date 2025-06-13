import TeamProblemFuzzTextArea from "@/components/TeamProblemFuzz";
import { submissionQueries } from "@/queries/submission.query";
import {
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Stack,
	TextField,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/admin/submissions/submission")({
	validateSearch: z.object({
		submissionId: z.coerce.number().int(),
	}),
	loaderDeps: ({ search }) => search,
	loader: async ({ deps, context: { queryClient } }) => {
		const initialSubmissionData = await queryClient.ensureQueryData(
			submissionQueries.submission(deps.submissionId),
		);

		return {
			initialSubmissionData,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { submissionId } = Route.useSearch();
	const navigate = Route.useNavigate();
	const loaderData = Route.useLoaderData();

	const submissionQuery = useQuery({
		...submissionQueries.submission(submissionId),
		initialData: loaderData.initialSubmissionData,
	});

	return (
		<Dialog
			open
			fullWidth
			maxWidth="xl"
			onClose={() =>
				navigate({
					to: "/admin/submissions",
					replace: true,
				})
			}
		>
			<DialogTitle>Submission {submissionId}</DialogTitle>
			<DialogContent>
				<DialogContentText>
					This is a placeholder for submission details. You can implement the
					details view for submission {submissionId} here.
				</DialogContentText>
				<Stack gap={2}>
					<TextField label="Submission ID" value={submissionId} disabled />
					<TextField
						label="Solution Status"
						value={submissionQuery.data?.ok ? "Solved" : "Incorrect"}
						disabled
					/>
					{submissionQuery.data?.problemSlug && submissionQuery.data.teamId ? (
						<TeamProblemFuzzTextArea
							problemSlug={submissionQuery.data.problemSlug}
							teamId={submissionQuery.data.teamId}
						/>
					) : null}
					<TextField
						label="Problem Solution Output"
						value={submissionQuery.data?.out ?? ""}
						disabled
						multiline
						rows={4}
						fullWidth
					/>
					<TextField
						label="Problem Solution Error"
						value={submissionQuery.data?.vler ?? ""}
						disabled
						multiline
						rows={4}
						fullWidth
					/>
					<TextField
						label="Problem Solution Code"
						value={submissionQuery.data?.code ?? ""}
						disabled
						multiline
						rows={10}
						fullWidth
					/>
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
