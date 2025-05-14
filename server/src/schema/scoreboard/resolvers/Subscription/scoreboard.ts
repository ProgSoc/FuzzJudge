import { scoreboard as compScoreboard } from "@/app";

import { pubSub } from "@/pubsub";
import type {
	ResolversTypes,
	SubscriptionResolvers,
} from "./../../../types.generated";
export const scoreboard: NonNullable<SubscriptionResolvers["scoreboard"]> = {
	subscribe: async function* (_parent, _arg, _ctx) {
		yield compScoreboard.fullScoreboard();

		const scoreboardSub = pubSub.subscribe("scoreboard");

		for await (const scoreboardUpdate of scoreboardSub) {
			yield scoreboardUpdate;
		}
	},
	resolve: (payload: Awaited<ResolversTypes["ScoreboardTeam"]>[]) => payload,
};
