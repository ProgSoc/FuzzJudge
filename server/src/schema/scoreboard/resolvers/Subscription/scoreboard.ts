import { pubSub } from "@/pubsub";
import { calculateScoreboard } from "@/services/score";
import type { ScoreboardRowMapper } from "../../schema.mappers";
import type { SubscriptionResolvers } from "./../../../types.generated";
export const scoreboard: NonNullable<SubscriptionResolvers["scoreboard"]> = {
	subscribe: async function* (_parent, _arg, _ctx) {
		yield calculateScoreboard();

		const scoreboardSub = pubSub.subscribe("scoreboard");

		for await (const scoreboardUpdate of scoreboardSub) {
			yield scoreboardUpdate;
		}
	},
	resolve: (payload: ScoreboardRowMapper[]) => payload,
};
