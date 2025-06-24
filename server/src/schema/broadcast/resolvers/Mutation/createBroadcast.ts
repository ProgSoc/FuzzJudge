import { pubSub } from "@/pubsub";
import type { MutationResolvers } from "./../../../types.generated";
export const createBroadcast: NonNullable<
	MutationResolvers["createBroadcast"]
> = async (_parent, { content, title }, _ctx) => {
	const id = Math.random().toString(36).substring(2, 15);

	const message = {
		id,
		content,
		title,
	};

	pubSub.publish("broadcast", message);

	return message;
};
