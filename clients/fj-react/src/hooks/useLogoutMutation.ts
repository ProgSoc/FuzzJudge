import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useLogoutMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: client.Logout,
		onSuccess: async () => {
			await queryClient.invalidateQueries();
			toaster.success({
				title: "Logged out successfully!",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "Logout failed",
				description: error.message,
			});
		},
	});
}
