import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { problemQueryKeys } from "@/queries/problem.query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useJudgeProblem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: client.SubmitProblem,
		onSuccess: ({ data }, vars) => {
			if (data.judge.__typename === "JudgeSuccessOutput") {
				queryClient.invalidateQueries({
					queryKey: problemQueryKeys.list(),
				});
				queryClient.invalidateQueries({
					queryKey: problemQueryKeys.problem(vars.slug),
				});
				toaster.success({
					title: "Correct Submission",
					description: "Your submission has been judged and is correct!",
				});
			} else {
				toaster.error({
					title: "Submission Incorrect",
					description: data.judge.message,
				});
			}
		},
		onError: (error) => {
			toaster.error({
				title: "Submission Failed",
				description: error.message,
			});
		},
	});
}
