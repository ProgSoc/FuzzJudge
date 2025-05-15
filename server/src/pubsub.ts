import { createPubSub } from "graphql-yoga";
import type { ScoreboardRowMapper } from "./schema/scoreboard/schema.mappers";
import type { ResolversTypes } from "./schema/types.generated";

type PubSub = {
	clock: [payload: Awaited<ResolversTypes["Clock"]>];
	scoreboard: [payload: ScoreboardRowMapper[]];
};

export const pubSub = createPubSub<PubSub>({});
