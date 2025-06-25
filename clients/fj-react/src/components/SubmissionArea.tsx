import { Button, Divider, Stack, Typography } from "@mui/material";

import useJudgeProblem from "@/hooks/useJudgeProblem";
import useZodForm, { type ZodSubmitHandler } from "@/hooks/useZodForm";
import { z } from "zod";
import ControlledTextField from "./ControlledTextField";
import { useEffect, useRef } from "react";

const submissionSchema = z.object({
	output: z.string(),
	code: z.string().min(1, "Code is required"),
});

export default function SubmissionArea(props: { problemSlug: string }) {
	const { problemSlug } = props;

	const {
		reset,
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useZodForm({
		schema: submissionSchema,
		defaultValues: {
			output: "",
			code: "",
		},
	});

	const problemSlugPrev = useRef<string>(problemSlug);

	useEffect(() => {
		if (problemSlugPrev.current === problemSlug) return;
		problemSlugPrev.current = problemSlug;

		reset({ output: "", code: "" });
	}, [problemSlug, reset]);

	const judgeMutation = useJudgeProblem();

	const onSubmit: ZodSubmitHandler<typeof submissionSchema> = async (data) => {
		await judgeMutation.mutateAsync({
			slug: problemSlug,
			code: data.code,
			output: data.output,
		});
	};

	return (
		<Stack
			spacing={2}
			divider={<Divider />}
			component={"form"}
			onSubmit={handleSubmit(onSubmit)}
		>
			<ControlledTextField
				control={control}
				name="code"
				multiline
				label="Code"
				helperText="Enter the code used to solve the problem."
				maxRows={10}
				slotProps={{
					input: { style: { fontFamily: "monospace" } },
				}}
			/>
			<ControlledTextField
				control={control}
				name="output"
				multiline
				label="Code Output"
				helperText="Enter the output that your code produced to solve the problem."
				maxRows={4}
				slotProps={{
					input: { style: { fontFamily: "monospace" } },
				}}
			/>
			<Button
				type="submit"
				variant="contained"
				color="primary"
				loading={isSubmitting}
			>
				Submit
			</Button>
			{judgeMutation.data?.data.judge.__typename === "JudgeErrorOutput" ? (
				<Typography variant="subtitle1" color="error">
					{judgeMutation.data.data.judge.errors}
				</Typography>
			) : null}
		</Stack>
	);
}
