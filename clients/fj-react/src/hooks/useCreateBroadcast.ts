import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { useMutation } from "@tanstack/react-query";

export default function useCreateBroadcast() {
	return useMutation({
		mutationFn: client.CreateBroadcast,
		onSuccess: () => {
			toaster.success({
				description: "Broadcast created successfully!",
			});
		},
		onError: (error) => {
			toaster.error({
				description: `Failed to create broadcast: ${error.message}`,
			});
		},
	});
}
