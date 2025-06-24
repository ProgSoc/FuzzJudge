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
			const calculatedScoreboard = await calculateScoreboard();
			const filteredScoreboard = calculatedScoreboard.filter(
				(row) => isAdmin || !row.teamHidden,
			);
			yield filteredScoreboard;
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
	resolve: (payload: ScoreboardRow[]) => {
		// rank the scoreboard
		const rankedScoreboard = payload
			.sort((teamA, teamB) => {
				if (teamB.points !== teamA.points) {
					return teamB.points - teamA.points; // Sort by points descending
				}
				return teamA.penalty - teamB.penalty; // If points are equal, sort by penalty ascending
			})
			.map((team, index) => ({
				...team,
				rank: index + 1, // Assign rank based on index
			}));
		return rankedScoreboard;
	},
};
