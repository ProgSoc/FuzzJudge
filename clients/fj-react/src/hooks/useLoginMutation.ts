import { toaster } from "@/components/Toaster";
import { client, wsClient } from "@/gql/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useLoginMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: client.Login,
		onSuccess: () => {
			queryClient.invalidateQueries();
			wsClient.terminate(); // Terminates existing WebSocket connection, will retry
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
