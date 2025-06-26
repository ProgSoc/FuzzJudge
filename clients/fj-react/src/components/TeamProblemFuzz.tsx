import { problemQuery } from "@/queries/problem.query";
import { TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

export default function TeamProblemFuzzTextArea(props: {
	teamId: string;
	problemSlug: string;
}) {
	const { teamId, problemSlug } = props;
	const teamProblemFuzzQuery = useQuery(
		problemQuery.teamProblemFuzz(problemSlug, teamId),
	);

	return (
		<TextField
			fullWidth
			multiline
			value={teamProblemFuzzQuery.data ?? ""}
			disabled
			label="Fuzz"
			variant="outlined"
			helperText="Fuzz that was generated for this team for this problem."
			sx={{ mt: 2, mb: 2 }}
		/>
	);
}
