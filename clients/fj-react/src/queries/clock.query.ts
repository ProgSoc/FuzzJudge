import { queryOptions } from "@tanstack/react-query";
import { updatingQuery } from "./updatingQuery";
import {
	ClockSubscriptionDocument,
	type ClockSubscriptionSubscription,
} from "@/gql";
import { wsClient } from "@/gql/client";

export const clockQueryKeys = {
	root: ["clock"],
	subscription: () => [...clockQueryKeys.root, "subscription"],
};

export const clockQueries = {
	clockSubscription: () =>
		queryOptions({
			queryKey: clockQueryKeys.subscription(),
			queryFn: updatingQuery<ClockSubscriptionSubscription>({
				payload: {
					query: ClockSubscriptionDocument,
				},
				client: wsClient,
			}),
		}),
};
