import { toaster } from "@/components/Toaster";
import { client, wsClient } from "@/gql/client";
import { userQueryKeys } from "@/queries/user.query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useLoginMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: client.Login,
		onSuccess: () => {
			wsClient.terminate(); // Terminates existing WebSocket connection, will retry
			queryClient.invalidateQueries({
				queryKey: userQueryKeys.me(),
			});
			toaster.success({
				title: "Logged in successfully!",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "Login failed",
				description: error.message,
			});
		},
	});
}
