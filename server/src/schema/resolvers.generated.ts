/* This file was automatically generated. DO NOT UPDATE MANUALLY. */
    import type   { Resolvers } from './types.generated';
    import    { competition as Query_competition } from './competition/resolvers/Query/competition';
import    { header as Query_header } from './base/resolvers/Query/header';
import    { problem as Query_problem } from './problems/resolvers/Query/problem';
import    { problems as Query_problems } from './problems/resolvers/Query/problems';
import    { submission as Query_submission } from './submissions/resolvers/Query/submission';
import    { submissions as Query_submissions } from './submissions/resolvers/Query/submissions';
import    { version as Query_version } from './base/resolvers/Query/version';
import    { adjustFinishTime as Mutation_adjustFinishTime } from './clock/resolvers/Mutation/adjustFinishTime';
import    { adjustStartTime as Mutation_adjustStartTime } from './clock/resolvers/Mutation/adjustStartTime';
import    { holdClock as Mutation_holdClock } from './clock/resolvers/Mutation/holdClock';
import    { judge as Mutation_judge } from './problems/resolvers/Mutation/judge';
import    { releaseClock as Mutation_releaseClock } from './clock/resolvers/Mutation/releaseClock';
import    { clock as Subscription_clock } from './clock/resolvers/Subscription/clock';
import    { scoreboard as Subscription_scoreboard } from './scoreboard/resolvers/Subscription/scoreboard';
import    { AlreadySolvedError } from './problems/resolvers/AlreadySolvedError';
import    { Clock } from './clock/resolvers/Clock';
import    { Competition } from './competition/resolvers/Competition';
import    { JudgeOutputSuccess } from './problems/resolvers/JudgeOutputSuccess';
import    { JudgingError } from './problems/resolvers/JudgingError';
import    { NotInTeamError } from './problems/resolvers/NotInTeamError';
import    { Problem } from './problems/resolvers/Problem';
import    { ProblemScore } from './scoreboard/resolvers/ProblemScore';
import    { ScoreboardTeam } from './scoreboard/resolvers/ScoreboardTeam';
import    { Submission } from './submissions/resolvers/Submission';
import    { TeamScore } from './scoreboard/resolvers/TeamScore';
import    { TeamTotal } from './scoreboard/resolvers/TeamTotal';
import    { DateTimeResolver } from 'graphql-scalars';
    export const resolvers: Resolvers = {
      Query: { competition: Query_competition,header: Query_header,problem: Query_problem,problems: Query_problems,submission: Query_submission,submissions: Query_submissions,version: Query_version },
      Mutation: { adjustFinishTime: Mutation_adjustFinishTime,adjustStartTime: Mutation_adjustStartTime,holdClock: Mutation_holdClock,judge: Mutation_judge,releaseClock: Mutation_releaseClock },
      Subscription: { clock: Subscription_clock,scoreboard: Subscription_scoreboard },
      AlreadySolvedError: AlreadySolvedError,
Clock: Clock,
Competition: Competition,
JudgeOutputSuccess: JudgeOutputSuccess,
JudgingError: JudgingError,
NotInTeamError: NotInTeamError,
Problem: Problem,
ProblemScore: ProblemScore,
ScoreboardTeam: ScoreboardTeam,
Submission: Submission,
TeamScore: TeamScore,
TeamTotal: TeamTotal,
DateTime: DateTimeResolver
    }