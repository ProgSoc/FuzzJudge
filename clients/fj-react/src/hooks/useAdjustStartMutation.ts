import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { useMutation } from "@tanstack/react-query";

export default function useAdjustStartMutation() {
	return useMutation({
		mutationFn: client.AdjustStartTime,
		onSuccess: () => {
			toaster.success({
				title: "Start time adjusted",
				description: "The start time has been successfully adjusted.",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "Error adjusting start time",
				description: error.message,
			});
		},
	});
}
