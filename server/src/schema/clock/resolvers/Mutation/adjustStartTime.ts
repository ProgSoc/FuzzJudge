import { adjustStart } from "@/v1/clock";
import type { MutationResolvers } from "./../../../types.generated";
export const adjustStartTime: NonNullable<
	MutationResolvers["adjustStartTime"]
> = async (_parent, { startTime, keepDuration }, _ctx) => {
	return adjustStart(
		startTime instanceof Date ? startTime : new Date(startTime),
		keepDuration ?? undefined,
	);
};
