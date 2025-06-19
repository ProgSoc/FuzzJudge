import type { DirectiveResolvers } from "@/schema/types.generated";
import { isRunning } from "@/services/clock";
import { GraphQLError } from "graphql";

export const clock: NonNullable<DirectiveResolvers["clock"]> = async (
	next,
	_parent,
	_args,
	{ user },
	_info,
) => {
	if (user?.role === "admin") {
		// Admins are exempt from clock protection
		return next();
	}
	const isCompRunning = await isRunning();
	if (!isCompRunning) {
		throw new GraphQLError(
			"Competition is not running. Please wait until it starts.",
			{
				extensions: {
					http: {
						status: 403,
					},
				},
			},
		);
	}
	return next();
};
