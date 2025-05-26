import { clock } from "@/app";
import { pubSub } from "@/pubsub";
import type { MutationResolvers } from "./../../../types.generated";
export const adjustStartTime: NonNullable<
	MutationResolvers["adjustStartTime"]
> = async (_parent, { startTime, keepDuration }, _ctx) => {
	const newClock = await clock.adjustStart(
		startTime instanceof Date ? startTime : new Date(startTime),
		{ keepDuration: keepDuration ?? undefined },
	);

	pubSub.publish("clock", newClock);

	return newClock;
};
