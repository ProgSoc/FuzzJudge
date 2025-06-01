import { pubSub } from "@/pubsub";
import { calculateScoreboard } from "@/services/score";
import type { ScoreboardRowMapper } from "../../schema.mappers";
import type { SubscriptionResolvers } from "./../../../types.generated";

// Todo: Score latest version of scoreboard in temp file and then when in the freeze period, use that file to calculate the scoreboard.
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
