import { pubSub } from "@/pubsub";
import {
	type ScoreboardRow,
	calculateScoreboard,
	getCachedScoreboard,
} from "@/services/score";
import { getCompetitionState, now } from "@/v1/clock";
import { filter, map, pipe } from "graphql-yoga";
import type { SubscriptionResolvers } from "./../../../types.generated";

const isScoreboardFrozen = async () => {
	const clockTime = await now();
	const competitionState = await getCompetitionState(clockTime);
	return (
		competitionState.includes("freeze") ||
		competitionState.includes("after") ||
		competitionState.includes("hold")
	);
};

// Todo: Score latest version of scoreboard in temp file and then when in the freeze period, use that file to calculate the scoreboard.
export const scoreboard: NonNullable<SubscriptionResolvers["scoreboard"]> = {
	subscribe: async function* (_parent, _arg, { c }) {
		const potentialUser = c.get("user");
		const isAdmin = potentialUser?.role === "admin";
		const isFrozen = await isScoreboardFrozen();
		if (isFrozen && !isAdmin) {
			// return a cached scoreboard if the scoreboard is frozen and the user is not an admin
			const scoreboard = await getCachedScoreboard();
			// Filter hidden teams if the user is not an admin
			yield scoreboard.filter((row) => !row.teamHidden);
		} else {
			yield await calculateScoreboard();
		}

		return pipe(
			pubSub.subscribe("scoreboard"),
			filter(async () => {
				if (isAdmin) return true; // Admins always see the full scoreboard and all updates
				const isFrozen = await isScoreboardFrozen();
				return !isFrozen; // Non-admins only see updates when the scoreboard is not frozen
			}),
			map((payload) => payload.filter((row) => isAdmin || !row.teamHidden)),
		);
	},
	resolve: (payload: ScoreboardRow[]) => payload,
};
