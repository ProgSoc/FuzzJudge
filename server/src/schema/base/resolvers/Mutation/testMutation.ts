import type { MutationResolvers } from "./../../../types.generated";
export const testMutation: NonNullable<
	MutationResolvers["testMutation"]
> = async (_parent, _arg, _ctx) => {
	return "testMutation";
};
