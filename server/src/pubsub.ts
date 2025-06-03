import { createPubSub } from "graphql-yoga";
import type { ResolversTypes } from "./schema/types.generated";
import type { ScoreboardRow } from "./services/score";

type PubSub = {
	clock: [payload: Awaited<ResolversTypes["Clock"]>];
	scoreboard: [payload: ScoreboardRow[]];
};

export const pubSub = createPubSub<PubSub>({});
