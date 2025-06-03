import type { DirectiveResolvers } from "@/schema/types.generated";
import { isRunning } from "@/v1/clock";

export const clock: NonNullable<DirectiveResolvers["clock"]> = async (
	next,
	_parent,
	_args,
	context,
	_info,
) => {
	if (context.c.get("user")?.role === "admin") {
		// Admins are exempt from clock protection
		return next();
	}
	const isCompRunning = await isRunning();
	if (!isCompRunning) {
		return null;
	}
	return next();
};
