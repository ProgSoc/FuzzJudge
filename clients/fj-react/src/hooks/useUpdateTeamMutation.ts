import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { teamQueryKeys } from "@/queries/team.query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useUpdateTeam() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: client.UpdateTeam,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: teamQueryKeys.detail(data.data.updateTeam.id),
			});

			queryClient.invalidateQueries({
				queryKey: teamQueryKeys.list(),
			});

			toaster.success({
				title: "Success",
				description: "Team updated successfully.",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "Error",
				description: error.message || "Failed to update team.",
			});
		},
	});
}
