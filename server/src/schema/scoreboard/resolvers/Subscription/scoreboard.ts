import { pubSub } from "@/pubsub";
import { isFrozen } from "@/services/clock";
import {
	type ScoreboardRow,
	calculateScoreboard,
	getCachedScoreboard,
} from "@/services/score";
import { filter, map, pipe } from "graphql-yoga";
import type { SubscriptionResolvers } from "./../../../types.generated";

// Todo: Score latest version of scoreboard in temp file and then when in the freeze period, use that file to calculate the scoreboard.
export const scoreboard: NonNullable<SubscriptionResolvers["scoreboard"]> = {
	subscribe: async function* (_parent, _arg, { user: potentialUser }) {
		const isAdmin = potentialUser?.role === "admin";
		// If they're an admin, or if the scoreboard is not frozen, calculate the scoreboard
		if ((await isFrozen()) && !isAdmin) {
			// return a cached scoreboard if the scoreboard is frozen and the user is not an admin
			const scoreboard = await getCachedScoreboard();
			// Filter hidden teams if the user is not an admin
			yield scoreboard.filter((row) => !row.teamHidden);
		} else {
			yield await calculateScoreboard();
		}

		const scoreboardUpdates = pipe(
			pubSub.subscribe("scoreboard"),
			filter(async () => {
				return !(await isFrozen()) || isAdmin; // Only allow updates if not frozen or user is admin
			}),
			map((payload) => payload.filter((row) => isAdmin || !row.teamHidden)),
		);

		for await (const payload of scoreboardUpdates) {
			yield payload;
		}
	},
	resolve: (payload: ScoreboardRow[]) => payload,
};
