import EventEmitter from "node:events";
import type { CompetitionClockMessage } from "./v1/clock";
import type { CompetitionScoreboardMessage } from "./v1/score";

interface EventEmitterTypes {
	clock: [CompetitionClockMessage];
	scoreboard: [CompetitionScoreboardMessage];
	scoreboardUpdate: [];
}

export const ee = new EventEmitter<EventEmitterTypes>();
