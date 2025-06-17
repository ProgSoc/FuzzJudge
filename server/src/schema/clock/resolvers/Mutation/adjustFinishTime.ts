import { adjustFinish } from "@/services/clock";
import type { MutationResolvers } from "./../../../types.generated";
export const adjustFinishTime: NonNullable<
	MutationResolvers["adjustFinishTime"]
> = async (_parent, { finishTime }, _ctx) => {
	return adjustFinish(
		finishTime instanceof Date ? finishTime : new Date(finishTime),
	);
};
