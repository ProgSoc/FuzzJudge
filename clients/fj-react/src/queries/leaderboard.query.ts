import { experimental_streamedQuery as streamedQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import {
	LeaderboardSubscriptionDocument,
	type LeaderboardSubscriptionSubscription,
} from "../gql";
import { wsClient } from "../gql/client";

export const leaderboardQueryKeys = {
	leaderboard: () => ["leaderboard"],
	subscription: () => ["leaderboard", "subscription"],
};

export const leaderboardQuery = {
	subscription: () =>
		queryOptions<LeaderboardSubscriptionSubscription["scoreboard"]>({
			queryKey: leaderboardQueryKeys.subscription(),
		}),
};
