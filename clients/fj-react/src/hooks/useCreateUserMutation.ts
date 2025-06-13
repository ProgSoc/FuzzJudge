import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { userQueryKeys } from "@/queries/user.query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useCreateUserMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: client.CreateUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.list() });
			toaster.success({
				title: "User created successfully!",
				description: "The new user has been created and is ready to use.",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "User creation failed",
				description: error.message,
			});
		},
	});
}
