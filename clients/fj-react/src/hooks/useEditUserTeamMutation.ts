import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { userQueryKeys } from "@/queries/user.query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useEditUserTeamMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: client.EditUserTeam,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.list() });
			toaster.success({
				title: "Success",
				description: "User team updated successfully.",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "Error",
				description: error.message || "Failed to update user team.",
			});
		},
	});
}
