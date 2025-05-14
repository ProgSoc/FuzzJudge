import { setTimeout as setTimeout$ } from "node:timers/promises";
import type { SubscriptionResolvers } from "./../../../types.generated";
export const countdown: NonNullable<SubscriptionResolvers["countdown"]> = {
	subscribe: async function* (_, { from }) {
		for (let i = from; i >= 0; i--) {
			await setTimeout$(1000);
			yield { countdown: i };
		}
	},
};
