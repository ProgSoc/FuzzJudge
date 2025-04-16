import EventEmitter from 'events';
import type { CompetitionClockMessage } from './clock';
import type { CompetitionScoreboardMessage } from './score';
import type { FuzzJudgeProblemSetMessage } from './comp';

interface EventEmitterTypes {
    clock: [CompetitionClockMessage],
    scoreboard: [CompetitionScoreboardMessage],
    scoreboardUpdate: [],
    problems: [FuzzJudgeProblemSetMessage]
}

export const ee = new EventEmitter<EventEmitterTypes>()