import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { useMutation } from "@tanstack/react-query";

export default function useReleaseClockMutation() {
	return useMutation({
		mutationFn: client.ReleaseClock,
		onSuccess: () => {
			toaster.success({
				title: "Clock released successfully",
				description: "The clock has been released.",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "Error releasing clock",
				description: error.message,
			});
		},
	});
}
