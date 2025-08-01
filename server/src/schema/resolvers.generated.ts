/* This file was automatically generated. DO NOT UPDATE MANUALLY. */
    import type   { Resolvers } from './types.generated';
    import    { competition as Query_competition } from './competition/resolvers/Query/competition';
import    { header as Query_header } from './base/resolvers/Query/header';
import    { me as Query_me } from './users/resolvers/Query/me';
import    { problem as Query_problem } from './problems/resolvers/Query/problem';
import    { problems as Query_problems } from './problems/resolvers/Query/problems';
import    { submission as Query_submission } from './submissions/resolvers/Query/submission';
import    { submissions as Query_submissions } from './submissions/resolvers/Query/submissions';
import    { team as Query_team } from './teams/resolvers/Query/team';
import    { teams as Query_teams } from './teams/resolvers/Query/teams';
import    { user as Query_user } from './users/resolvers/Query/user';
import    { users as Query_users } from './users/resolvers/Query/users';
import    { version as Query_version } from './base/resolvers/Query/version';
import    { adjustFinishTime as Mutation_adjustFinishTime } from './clock/resolvers/Mutation/adjustFinishTime';
import    { adjustStartTime as Mutation_adjustStartTime } from './clock/resolvers/Mutation/adjustStartTime';
import    { createBroadcast as Mutation_createBroadcast } from './broadcast/resolvers/Mutation/createBroadcast';
import    { createTeam as Mutation_createTeam } from './teams/resolvers/Mutation/createTeam';
import    { createUser as Mutation_createUser } from './users/resolvers/Mutation/createUser';
import    { deleteTeam as Mutation_deleteTeam } from './teams/resolvers/Mutation/deleteTeam';
import    { deleteUser as Mutation_deleteUser } from './users/resolvers/Mutation/deleteUser';
import    { getAdminFuzz as Mutation_getAdminFuzz } from './problems/resolvers/Mutation/getAdminFuzz';
import    { holdClock as Mutation_holdClock } from './clock/resolvers/Mutation/holdClock';
import    { judge as Mutation_judge } from './problems/resolvers/Mutation/judge';
import    { login as Mutation_login } from './users/resolvers/Mutation/login';
import    { logout as Mutation_logout } from './users/resolvers/Mutation/logout';
import    { overrideJudge as Mutation_overrideJudge } from './submissions/resolvers/Mutation/overrideJudge';
import    { register as Mutation_register } from './users/resolvers/Mutation/register';
import    { releaseClock as Mutation_releaseClock } from './clock/resolvers/Mutation/releaseClock';
import    { releaseResults as Mutation_releaseResults } from './clock/resolvers/Mutation/releaseResults';
import    { updateTeam as Mutation_updateTeam } from './teams/resolvers/Mutation/updateTeam';
import    { updateUser as Mutation_updateUser } from './users/resolvers/Mutation/updateUser';
import    { broadcasts as Subscription_broadcasts } from './broadcast/resolvers/Subscription/broadcasts';
import    { clock as Subscription_clock } from './clock/resolvers/Subscription/clock';
import    { scoreboard as Subscription_scoreboard } from './scoreboard/resolvers/Subscription/scoreboard';
import    { Broadcast } from './broadcast/resolvers/Broadcast';
import    { Clock } from './clock/resolvers/Clock';
import    { Competition } from './competition/resolvers/Competition';
import    { JudgeErrorOutput } from './problems/resolvers/JudgeErrorOutput';
import    { JudgeSuccessOutput } from './problems/resolvers/JudgeSuccessOutput';
import    { Problem } from './problems/resolvers/Problem';
import    { ProblemScore } from './scoreboard/resolvers/ProblemScore';
import    { ScoreboardRow } from './scoreboard/resolvers/ScoreboardRow';
import    { Submission } from './submissions/resolvers/Submission';
import    { Team } from './teams/resolvers/Team';
import    { User } from './users/resolvers/User';
import    { JudgeOutput } from './problems/resolvers/JudgeOutput';
import    { DateTimeResolver } from 'graphql-scalars';
    export const resolvers: Resolvers = {
      Query: { competition: Query_competition,header: Query_header,me: Query_me,problem: Query_problem,problems: Query_problems,submission: Query_submission,submissions: Query_submissions,team: Query_team,teams: Query_teams,user: Query_user,users: Query_users,version: Query_version },
      Mutation: { adjustFinishTime: Mutation_adjustFinishTime,adjustStartTime: Mutation_adjustStartTime,createBroadcast: Mutation_createBroadcast,createTeam: Mutation_createTeam,createUser: Mutation_createUser,deleteTeam: Mutation_deleteTeam,deleteUser: Mutation_deleteUser,getAdminFuzz: Mutation_getAdminFuzz,holdClock: Mutation_holdClock,judge: Mutation_judge,login: Mutation_login,logout: Mutation_logout,overrideJudge: Mutation_overrideJudge,register: Mutation_register,releaseClock: Mutation_releaseClock,releaseResults: Mutation_releaseResults,updateTeam: Mutation_updateTeam,updateUser: Mutation_updateUser },
      Subscription: { broadcasts: Subscription_broadcasts,clock: Subscription_clock,scoreboard: Subscription_scoreboard },
      Broadcast: Broadcast,
Clock: Clock,
Competition: Competition,
JudgeErrorOutput: JudgeErrorOutput,
JudgeSuccessOutput: JudgeSuccessOutput,
Problem: Problem,
ProblemScore: ProblemScore,
ScoreboardRow: ScoreboardRow,
Submission: Submission,
Team: Team,
User: User,
JudgeOutput: JudgeOutput,
DateTime: DateTimeResolver
    }