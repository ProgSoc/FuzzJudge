import type { DirectiveResolvers } from "@/schema/types.generated";
import { auth } from "./resolvers/auth";
import { clock } from "./resolvers/clock";

export const directiveResolvers: DirectiveResolvers = {
	auth,
	clock,
};
