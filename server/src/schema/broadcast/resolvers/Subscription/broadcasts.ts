import { pubSub } from "@/pubsub";
import type {
	ResolversTypes,
	SubscriptionResolvers,
} from "./../../../types.generated";
export const broadcasts: NonNullable<SubscriptionResolvers["broadcasts"]> = {
	subscribe: async (_parent, _arg, _ctx) => pubSub.subscribe("broadcast"),
	resolve: (payload: ResolversTypes["Broadcast"]) => payload,
};
