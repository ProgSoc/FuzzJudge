import { type InferResponseType, client } from "@/client";
import { problemQueryKeys } from "@/queries/problems.queries";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SolveProblemData {
	solutionFile: File;
	solutionOutput: string;
	problemId: string;
}

type SolutionResponseType = Awaited<
	ReturnType<(typeof client.problems)[":id"]["solve"]["$post"]>
>;

export default function useSolveProblem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: SolveProblemData) =>
			client.problems[":id"].solve
				.$post({
					param: {
						id: data.problemId,
					},
					form: {
						solutionFile: data.solutionFile,
						solutionOutput: data.solutionOutput,
					},
				})
				.then((res) => {
					if (!res.ok) {
						throw res;
					}
					return res;
				}),
		onSuccess: (successData, vars) => {
			queryClient.invalidateQueries({ queryKey: problemQueryKeys.list() });
			queryClient.invalidateQueries({
				queryKey: problemQueryKeys.problem(vars.problemId),
			});
		},
		onError: async (err: SolutionResponseType) => {
			switch (err.status) {
				case 500:
					notifications.show({
						title: "Error",
						message: "Internal server error",
						color: "red",
					});
					break;
				case 401:
					notifications.show({
						title: "Error",
						message: (await err.text()) || "Unauthorized",
						color: "red",
					});
					break;
				case 403:
					notifications.show({
						title: "Error",
						message: (await err.text()) || "User not in a team",
						color: "red",
					});
					break;
				case 409:
					notifications.show({
						title: "Error",
						message: (await err.text()) || "Problem already solved",
						color: "red",
					});
					break;
				case 422:
					notifications.show({
						title: "Error",
						message: (await err.text()) || "Invalid input",

						color: "red",
					});
					break;
				default:
					// Handle other errors
					break;
			}
		},
	});
}
