import { clock } from "@/app";
import { pubSub } from "@/pubsub";
import type { MutationResolvers } from "./../../../types.generated";
export const adjustFinishTime: NonNullable<
	MutationResolvers["adjustFinishTime"]
> = async (_parent, { finishTime }, _ctx) => {
	const newClock = await clock.adjustFinish(
		finishTime instanceof Date ? finishTime : new Date(finishTime),
	);

	pubSub.publish("clock", newClock);

	return newClock;
};
