import EventEmitter from 'events';
import type { CompetitionClockMessage } from './clock';
import type { CompetitionScoreboardMessage } from './score';

interface EventEmitterTypes {
    clock: [CompetitionClockMessage],
    scoreboard: [CompetitionScoreboardMessage],
    scoreboardUpdate: [],
}

export const ee = new EventEmitter<EventEmitterTypes>()