import { toaster } from "@/components/Toaster";
import { client } from "@/gql/client";
import { useMutation } from "@tanstack/react-query";

export default function useAdjustEndMutation() {
	return useMutation({
		mutationFn: client.AdjustFinishTime,
		onSuccess: () => {
			toaster.success({
				title: "End time adjusted",
				description: "The end time has been successfully adjusted.",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "Error adjusting end time",
				description: error.message,
			});
		},
	});
}
