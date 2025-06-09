import { client } from "@/gql/client";
import { teamQueryKeys } from "@/queries/team.query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useCreateTeamMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: client.CreateTeam,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: teamQueryKeys.list() });
		},
	});
}
