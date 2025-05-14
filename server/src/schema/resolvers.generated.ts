/* This file was automatically generated. DO NOT UPDATE MANUALLY. */
    import type   { Resolvers } from './types.generated';
    import    { competition as Query_competition } from './competition/resolvers/Query/competition';
import    { header as Query_header } from './base/resolvers/Query/header';
import    { version as Query_version } from './base/resolvers/Query/version';
import    { testMutation as Mutation_testMutation } from './base/resolvers/Mutation/testMutation';
import    { clock as Subscription_clock } from './clock/resolvers/Subscription/clock';
import    { countdown as Subscription_countdown } from './base/resolvers/Subscription/countdown';
import    { scoreboard as Subscription_scoreboard } from './scoreboard/resolvers/Subscription/scoreboard';
import    { Clock } from './clock/resolvers/Clock';
import    { CompetitionQuery } from './competition/resolvers/CompetitionQuery';
import    { ProblemScore } from './scoreboard/resolvers/ProblemScore';
import    { ScoreboardTeam } from './scoreboard/resolvers/ScoreboardTeam';
import    { Submission } from './competition/resolvers/Submission';
import    { TeamScore } from './scoreboard/resolvers/TeamScore';
import    { TeamTotal } from './scoreboard/resolvers/TeamTotal';
import    { DateTimeResolver } from 'graphql-scalars';
    export const resolvers: Resolvers = {
      Query: { competition: Query_competition,header: Query_header,version: Query_version },
      Mutation: { testMutation: Mutation_testMutation },
      Subscription: { clock: Subscription_clock,countdown: Subscription_countdown,scoreboard: Subscription_scoreboard },
      Clock: Clock,
CompetitionQuery: CompetitionQuery,
ProblemScore: ProblemScore,
ScoreboardTeam: ScoreboardTeam,
Submission: Submission,
TeamScore: TeamScore,
TeamTotal: TeamTotal,
DateTime: DateTimeResolver
    }