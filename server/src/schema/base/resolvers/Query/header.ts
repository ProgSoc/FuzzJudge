import { HEADER } from "@/version";
import type { QueryResolvers } from "./../../../types.generated";
export const header: NonNullable<QueryResolvers["header"]> = async (
	_parent,
	_arg,
	_ctx,
) => {
	return HEADER;
};
