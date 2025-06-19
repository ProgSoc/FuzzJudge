import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useRegisterMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: client.Register,
		onSuccess: () => {
			queryClient.invalidateQueries();
			toaster.success({
				title: "Registered successfully! Please log in.",
				description: "You can now log in with your new account.",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "Registration failed",
				description: error.message,
			});
		},
	});
}
