import { createPubSub } from "graphql-yoga";
import type { ResolversTypes } from "./schema/types.generated";

type PubSub = {
	clock: [payload: Awaited<ResolversTypes["Clock"]>];
	scoreboard: [payload: Awaited<ResolversTypes["ScoreboardTeam"]>];
};

export const pubSub = createPubSub<PubSub>({});
