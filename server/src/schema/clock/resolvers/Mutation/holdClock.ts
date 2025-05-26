import { clock } from "@/app";
import { pubSub } from "@/pubsub";
import type { MutationResolvers } from "./../../../types.generated";
export const holdClock: NonNullable<MutationResolvers["holdClock"]> = async (
	_parent,
	_arg,
	_ctx,
) => {
	const newClock = await clock.hold();

	pubSub.publish("clock", newClock);

	return newClock;
};
