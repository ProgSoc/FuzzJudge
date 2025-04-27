import useSolveProblem from "@/hooks/useSolveProblem";
import useZodForm from "@/hooks/useZodForm";
import { problemQueries } from "@/queries/problems.queries";
import { CodeHighlight } from "@mantine/code-highlight";
import {
	Button,
	Code,
	Divider,
	FileInput,
	type FileInputProps,
	Textarea,
	Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	type Control,
	type FieldPath,
	type FieldValues,
	useController,
} from "react-hook-form";
import Markdown from "react-markdown";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/problems/$problemId")({
	component: RouteComponent,
});

const SubmissionSchema = z.object({
	solutionOutput: z.string(),
	solutionFile: z.instanceof(File),
});

function RouteComponent() {
	const { problemId } = Route.useParams();
	const { data } = useQuery(problemQueries.getProblem(problemId));
	const solveProblemMutation = useSolveProblem();

	const {
		register,
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useZodForm({
		schema: SubmissionSchema,
	});

	const onSubmit = (submData: z.infer<typeof SubmissionSchema>) =>
		solveProblemMutation.mutateAsync({
			problemId,
			solutionOutput: submData.solutionOutput,
			solutionFile: submData.solutionFile,
		});

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Title order={2} mb="md">
				Problem Instructions
			</Title>
			<Markdown>{data?.content}</Markdown>
			<Divider my="md" />
			<Title order={2} mb="md">
				Problem Input
			</Title>
			<CodeHighlight withCopyButton code={data?.fuzzInput ?? ""} />
			<Divider my="md" />
			<Title order={2} mb="md">
				Submission
			</Title>
			Submit the output of your program below. The input will be passed to your
			program via stdin.
			<Textarea
				{...register("solutionOutput")}
				placeholder="Output"
				minRows={5}
				maxRows={10}
				mb="md"
			/>
			<Divider my="md" />
			<Title order={2} mb="md">
				Submission Files
			</Title>
			If there are any issues with the submission the competition admin will use
			the files below to debug.
			<ControlledFileInput
				placeholder="Upload file"
				control={control}
				name="solutionFile"
				accept="*"
				mb="md"
			/>
			<Button type="submit" mt="md" loading={isSubmitting}>
				Submit
			</Button>
		</form>
	);
}

interface ControlledFileInputProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	Multiple = false,
> extends FileInputProps<Multiple> {
	/** The name of the field to register */
	name: TName;
	/** The control object returned from useForm */
	control: Control<TFieldValues>;
}

function ControlledFileInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	Multiple = false,
>({
	name,
	control,
	multiple,
	...props
}: ControlledFileInputProps<TFieldValues, TName, Multiple>) {
	const { field } = useController({ name, control });

	return (
		<FileInput
			{...field}
			{...props}
			multiple={multiple as boolean}
			onChange={(files) => {
				field.onChange(files);
			}}
			value={field.value}
		/>
	);
}
