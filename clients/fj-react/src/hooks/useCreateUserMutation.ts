import { client } from "@/gql/client";
import { userQueryKeys } from "@/queries/user.query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useCreateUserMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: client.CreateUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.list() });
		},
	});
}
