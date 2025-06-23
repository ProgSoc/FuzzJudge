import {
	LeaderboardSubscriptionDocument,
	type LeaderboardSubscriptionSubscription,
} from "@/gql";
import { wsClient } from "@/gql/client";
import { updatingQuery } from "./updatingQuery";
import { queryOptions } from "@tanstack/react-query";

export const leaderboardQueryKeys = {
	root: ["leaderboard"],
	subscription: () => [...leaderboardQueryKeys.root, "subscription"],
};

export const leaderboardQueries = {
	leaderboardSubscription: () =>
		queryOptions({
			queryKey: leaderboardQueryKeys.subscription(),
			queryFn: updatingQuery<LeaderboardSubscriptionSubscription>({
				payload: {
					query: LeaderboardSubscriptionDocument,
				},
				client: wsClient,
			}),
		}),
};
