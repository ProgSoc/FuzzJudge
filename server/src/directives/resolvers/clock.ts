import type { DirectiveResolvers } from "@/schema/types.generated";
import { protectClock } from "@/v1/clock";

export const clock: NonNullable<DirectiveResolvers["clock"]> = async (
	next,
	parent,
	{ disallowedStatus },
	context,
	info,
) => {
	if (context.c.get("user")?.role === "admin") {
		// Admins are exempt from clock protection
		return next();
	}
	await protectClock(disallowedStatus);
	return next();
};
