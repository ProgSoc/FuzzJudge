import SubmissionArea from "@/components/SubmissionArea";
import { problemQuery } from "@/queries/problem.query";
import {
	Box,
	Button,
	Chip,
	Divider,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
	type ErrorComponentProps,
	createFileRoute,
} from "@tanstack/react-router";
import { MdCheck, MdDelete } from "react-icons/md";
import Markdown from "react-markdown";

export const Route = createFileRoute("/problems/$slug")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	errorComponent: ErrorComponent,
	loader: async ({ params, context: { queryClient } }) => {
		queryClient.prefetchQuery(problemQuery.problemDetails(params.slug));
	},
});

function ErrorComponent(props: ErrorComponentProps) {
	const { reset } = props;
	return (
		<Stack spacing={2} alignItems="center" justifyContent="center">
			<Typography variant="h5" component="h2" gutterBottom>
				An error occurred while loading the problem.
			</Typography>
			<Button variant="contained" onClick={reset}>
				Retry
			</Button>
		</Stack>
	);
}

function PendingComponent() {
	return (
		<Typography variant="h5" component="h2" gutterBottom>
			Loading problem details...
		</Typography>
	);
}

function RouteComponent() {
	const { slug } = Route.useParams();

	const problemData = useSuspenseQuery(problemQuery.problemDetails(slug));

	return (
		<>
			<Typography variant="h3" component="h1" gutterBottom>
				{problemData.data.name}
			</Typography>
			<Box
				sx={{ flexDirection: "row", display: "flex", gap: 2, flexWrap: "wrap" }}
			>
				{problemData.data.solved === true ? (
					<Chip label="Solved" color="success" icon={<MdCheck />} />
				) : problemData.data.solved === false ? (
					<Chip label="Not Solved" color="error" icon={<MdDelete />} />
				) : null}
				<Chip label={`Points: ${problemData.data.points}`} color="primary" />
				<Chip label={`Difficulty: ${problemData.data.difficulty}`} />
			</Box>
			<Markdown>{problemData.data.instructions}</Markdown>
			{problemData.data.fuzz ? (
				<TextField
					value={problemData.data.fuzz}
					slotProps={{
						input: { readOnly: true },
					}}
					fullWidth
					multiline
					label="Fuzz"
					helperText="Fuzz is a randomly generated input that you use as the input to your code."
					sx={{ mt: 2, mb: 2 }}
					variant="outlined"
					rows={4}
				/>
			) : null}

			<SubmissionArea problemSlug={slug} />
		</>
	);
}
