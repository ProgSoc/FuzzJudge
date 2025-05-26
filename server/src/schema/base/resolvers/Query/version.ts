import { VERSION } from "@/version";
import type { QueryResolvers } from "./../../../types.generated";
export const version: NonNullable<QueryResolvers["version"]> = async (
	_parent,
	_arg,
	_ctx,
) => {
	return VERSION;
};
