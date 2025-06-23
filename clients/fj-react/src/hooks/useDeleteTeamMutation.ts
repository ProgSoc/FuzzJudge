import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { teamQueryKeys } from "@/queries/team.query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useDeleteTeamMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: client.DeleteTeam,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: teamQueryKeys.list(),
			});
			queryClient.invalidateQueries({
				queryKey: teamQueryKeys.detail(data.data.deleteTeam.id),
			});
			toaster.success({
				title: "Team deleted successfully",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "Failed to delete team",
				description: error.message,
			});
		},
	});
}
