import { queryOptions } from "@tanstack/react-query";
import {
	LeaderboardSubscriptionDocument,
	type LeaderboardSubscriptionSubscription,
} from "../gql";
import { wsClient } from "../gql/client";
import { streamedQuery } from "./streamedQuery";

export const leaderboardQueryKeys = {
	leaderboard: () => ["leaderboard"],
	subscription: () => ["leaderboard", "subscription"],
};

export const leaderboardQuery = {
	subscription: () =>
		queryOptions({
			queryKey: leaderboardQueryKeys.subscription(),
			queryFn: streamedQuery({
				queryFn: () =>
					wsClient.iterate<LeaderboardSubscriptionSubscription>({
						query: LeaderboardSubscriptionDocument,
					}),
			}),
		}),
};
