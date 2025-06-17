import { holdClockTime } from "@/services/clock";
import type { MutationResolvers } from "./../../../types.generated";
export const holdClock: NonNullable<MutationResolvers["holdClock"]> = async (
	_parent,
	_arg,
	_ctx,
) => {
	return holdClockTime();
};
