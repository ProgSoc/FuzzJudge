import { Box, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	type ErrorComponentProps,
} from "@tanstack/react-router";
import SubmissionArea from "@/components/SubmissionArea";
import { problemQuery } from "@/queries/problem.query";
import CustomMarkdown from "@/utils/mdSettings";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import useDownloadText from "@/hooks/useDownloadText";
import CheckIcon from "@mui/icons-material/Check";
import difficultyToLabel from "@/utils/difficultyToLabel";

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
			{import.meta.env.DEV ? (
				<Typography variant="body2" color="error">
					{props.error.message}
				</Typography>
			) : null}
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

	const [, copy] = useCopyToClipboard();
	const downloadText = useDownloadText();

	return (
		<Stack spacing={2}>
			<Typography variant="h3" component="h1" gutterBottom>
				{problemData.data.name}
			</Typography>
			<Box
				sx={{ flexDirection: "row", display: "flex", gap: 2, flexWrap: "wrap" }}
			>
				{problemData.data.solved ? (
					<Chip label="Solved" color="success" icon={<CheckIcon />} />
				) : (
					<Chip label="Unsolved" />
				)}

				<Chip label={`Points: ${problemData.data.points}`} color="primary" />
				<Chip
					label={`Difficulty: ${difficultyToLabel(problemData.data.difficulty)}`}
				/>
			</Box>
			<CustomMarkdown>{problemData.data.instructions}</CustomMarkdown>
			{problemData.data.fuzz ? (
				<>
					<TextField
						value={problemData.data.fuzz}
						slotProps={{
							input: { readOnly: true, style: { fontFamily: "monospace" } },
						}}
						fullWidth
						multiline
						label="Fuzz"
						helperText="Fuzz is a randomly generated input that you use as the input to your code."
						sx={{ mt: 2, mb: 2 }}
						variant="outlined"
						rows={4}
					/>
					<Stack direction="row" spacing={2}>
						<Button
							variant="contained"
							onClick={() => copy(problemData.data.fuzz)}
						>
							Copy Fuzz
						</Button>
						<Button
							variant="contained"
							onClick={() =>
								downloadText(
									`${problemData.data.slug}-fuzz.txt`,
									problemData.data.fuzz,
								)
							}
						>
							Download Fuzz
						</Button>
					</Stack>
				</>
			) : null}

			<SubmissionArea problemSlug={slug} />
		</Stack>
	);
}
