import { releaseClockTime } from "@/v1/clock";
import type { MutationResolvers } from "./../../../types.generated";
export const releaseClock: NonNullable<
	MutationResolvers["releaseClock"]
> = async (_parent, { extendDuration }, _ctx) => {
	return releaseClockTime(extendDuration ?? undefined);
};
