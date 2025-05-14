import { clock } from "@/app";
import { pubSub } from "@/pubsub";
import type { MutationResolvers } from "./../../../types.generated";
export const releaseClock: NonNullable<
	MutationResolvers["releaseClock"]
> = async (_parent, { extendDuration }, _ctx) => {
	const newClock = await clock.release({
		extendDuration: extendDuration ?? undefined,
	});

	pubSub.publish("clock", newClock);

	return newClock;
};
