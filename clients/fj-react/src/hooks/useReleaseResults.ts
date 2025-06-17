import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { useMutation } from "@tanstack/react-query";

export default function useReleaseResults() {
	return useMutation({
		mutationFn: client.ReleaseResults,
		onSuccess: () => {
			toaster.success({
				title: "Results released successfully",
				description: "The results have been released.",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "Error releasing results",
				description: error.message,
			});
		},
	});
}
