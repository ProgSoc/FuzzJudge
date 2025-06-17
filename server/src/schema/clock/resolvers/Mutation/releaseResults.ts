import { releaseResults as clockReleaseResults } from "@/services/clock";
import type { MutationResolvers } from "./../../../types.generated";
export const releaseResults: NonNullable<
	MutationResolvers["releaseResults"]
> = async (_parent, _arg, _ctx) => {
	const newTimes = await clockReleaseResults();
	return newTimes;
};
