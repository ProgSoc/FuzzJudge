import {
	ClockSubscriptionDocument,
	type ClockSubscriptionSubscription,
} from "@/gql";
import { wsClient } from "@/gql/client";
import {
	experimental_streamedQuery,
	queryOptions,
} from "@tanstack/react-query";

export const clockQueryKeys = {
	root: () => ["clock"],
	current: () => [...clockQueryKeys.root(), "current"],
};

export const clockQueries = {
	current: () =>
		queryOptions({
			queryKey: clockQueryKeys.current(),
			queryFn: experimental_streamedQuery({
				queryFn: () =>
					wsClient.iterate<ClockSubscriptionSubscription>({
						query: ClockSubscriptionDocument,
					}),
				maxChunks: 1,
				refetchMode: "replace",
			}),
		}),
};
