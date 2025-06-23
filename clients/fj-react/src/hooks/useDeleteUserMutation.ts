import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { userQueryKeys } from "@/queries/user.query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useDeleteUserMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: client.DeleteUser,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: userQueryKeys.list(),
			});
			queryClient.invalidateQueries({
				queryKey: userQueryKeys.detail(data.data.deleteUser.id),
			});
			toaster.success({
				title: "User deleted successfully",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "Failed to delete user",
				description: error.message,
			});
		},
	});
}
