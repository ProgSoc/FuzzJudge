import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { useMutation } from "@tanstack/react-query";

export default function useHoldClockMutation() {
	return useMutation({
		mutationFn: client.HoldClock,
		onSuccess: () => {
			toaster.success({
				title: "Clock held successfully",
				description: "The clock has been held.",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "Error holding clock",
				description: error.message,
			});
		},
	});
}
