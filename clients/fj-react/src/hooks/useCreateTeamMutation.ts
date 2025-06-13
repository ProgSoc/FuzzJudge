import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { teamQueryKeys } from "@/queries/team.query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useCreateTeamMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: client.CreateTeam,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: teamQueryKeys.list() });
			toaster.success({
				title: "Team created successfully!",
				description: "Your team has been created and is ready to use.",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "Team creation failed",
				description: error.message,
			});
		},
	});
}
