import { pubSub } from "@/pubsub";
import { now } from "@/v1/clock";
import type {
	ResolversTypes,
	SubscriptionResolvers,
} from "./../../../types.generated";

export const clock: NonNullable<SubscriptionResolvers["clock"]> = {
	subscribe: async function* (_parent, _arg, _ctx) {
		yield now();

		const clockSub = pubSub.subscribe("clock");

		for await (const clockUpdate of clockSub) {
			yield clockUpdate;
		}
	},
	resolve: (payload: ResolversTypes["Clock"]) => payload,
};
