import type { DirectiveResolvers } from "@/schema/types.generated";
import { auth } from "./resolvers/auth";

export const directiveResolvers: DirectiveResolvers = {
	auth,
};
