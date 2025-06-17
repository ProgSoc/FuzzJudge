import type { GraphQLClient, RequestOptions } from 'graphql-request';
import { GraphQLError } from 'graphql'
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: Date | string; output: Date | string; }
  File: { input: File; output: File; }
};

export type Clock = {
  __typename?: 'Clock';
  finish: Scalars['DateTime']['output'];
  hold?: Maybe<Scalars['DateTime']['output']>;
  start: Scalars['DateTime']['output'];
};

export enum ClockStatus {
  After = 'after',
  Before = 'before',
  Freeze = 'freeze',
  Hold = 'hold',
  Running = 'running'
}

export type Competition = {
  __typename?: 'Competition';
  brief: Scalars['String']['output'];
  instructions: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type JudgeErrorOutput = {
  __typename?: 'JudgeErrorOutput';
  errors: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type JudgeOutput = JudgeErrorOutput | JudgeSuccessOutput;

export type JudgeSuccessOutput = {
  __typename?: 'JudgeSuccessOutput';
  message: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  adjustFinishTime: Clock;
  adjustStartTime: Clock;
  createTeam: Team;
  createUser: User;
  deleteTeam: Team;
  deleteUser: User;
  getAdminFuzz: Scalars['String']['output'];
  holdClock: Clock;
  judge: JudgeOutput;
  login: User;
  logout: Scalars['Boolean']['output'];
  overrideJudge: Submission;
  register: User;
  releaseClock: Clock;
  releaseResults: Clock;
  updateTeam: Team;
  updateUser: User;
};


export type MutationAdjustFinishTimeArgs = {
  finishTime: Scalars['DateTime']['input'];
};


export type MutationAdjustStartTimeArgs = {
  keepDuration?: InputMaybe<Scalars['Boolean']['input']>;
  startTime: Scalars['DateTime']['input'];
};


export type MutationCreateTeamArgs = {
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateUserArgs = {
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: UserRole;
  teamId?: InputMaybe<Scalars['Int']['input']>;
  username: Scalars['String']['input'];
};


export type MutationDeleteTeamArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['Int']['input'];
};


export type MutationGetAdminFuzzArgs = {
  slug: Scalars['String']['input'];
  teamId: Scalars['Int']['input'];
};


export type MutationJudgeArgs = {
  code: Scalars['String']['input'];
  output: Scalars['String']['input'];
  slug: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationOverrideJudgeArgs = {
  solved: Scalars['Boolean']['input'];
  submissionId: Scalars['Int']['input'];
};


export type MutationRegisterArgs = {
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationReleaseClockArgs = {
  extendDuration?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationUpdateTeamArgs = {
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateUserArgs = {
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
  teamId?: InputMaybe<Scalars['Int']['input']>;
};

export type Problem = {
  __typename?: 'Problem';
  brief: Scalars['String']['output'];
  difficulty: Scalars['Int']['output'];
  fuzz?: Maybe<Scalars['String']['output']>;
  icon: Scalars['String']['output'];
  instructions?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  points: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  solved?: Maybe<Scalars['Boolean']['output']>;
};


export type ProblemFuzzArgs = {
  teamId?: InputMaybe<Scalars['Int']['input']>;
};

export type ProblemScore = {
  __typename?: 'ProblemScore';
  penalty: Scalars['Float']['output'];
  points: Scalars['Int']['output'];
  problem: Problem;
  slug: Scalars['String']['output'];
  solved: Scalars['Boolean']['output'];
  tries: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  competition: Competition;
  header: Scalars['String']['output'];
  me?: Maybe<User>;
  problem: Problem;
  problems: Array<Problem>;
  submission?: Maybe<Submission>;
  submissions: Array<Submission>;
  team: Team;
  teams: Array<Team>;
  user: User;
  users: Array<User>;
  version: Scalars['String']['output'];
};


export type QueryProblemArgs = {
  slug: Scalars['String']['input'];
};


export type QuerySubmissionArgs = {
  id: Scalars['Int']['input'];
};


export type QuerySubmissionsArgs = {
  problemSlug?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTeamArgs = {
  id: Scalars['Int']['input'];
};


export type QueryUserArgs = {
  id: Scalars['Int']['input'];
};

export type ScoreboardRow = {
  __typename?: 'ScoreboardRow';
  penalty: Scalars['Float']['output'];
  points: Scalars['Int']['output'];
  problems: Array<ProblemScore>;
  rank: Scalars['Int']['output'];
  team: Team;
  teamId: Scalars['Int']['output'];
};

export type Submission = {
  __typename?: 'Submission';
  code?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  ok?: Maybe<Scalars['Boolean']['output']>;
  out?: Maybe<Scalars['String']['output']>;
  problem: Problem;
  problemSlug: Scalars['String']['output'];
  team: Team;
  teamId: Scalars['Int']['output'];
  time: Scalars['DateTime']['output'];
  vler?: Maybe<Scalars['String']['output']>;
  vlms?: Maybe<Scalars['Float']['output']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  clock: Clock;
  scoreboard: Array<ScoreboardRow>;
};

export type Team = {
  __typename?: 'Team';
  hidden: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  members: Array<User>;
  name: Scalars['String']['output'];
  seed: Scalars['String']['output'];
  submissions: Array<Submission>;
};


export type TeamSubmissionsArgs = {
  problemSlug?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  role: UserRole;
  team?: Maybe<Team>;
  teamId?: Maybe<Scalars['Int']['output']>;
  username: Scalars['String']['output'];
};

export enum UserRole {
  Admin = 'admin',
  Competitor = 'competitor'
}

export type AdjustFinishTimeMutationVariables = Exact<{
  endTime: Scalars['DateTime']['input'];
}>;


export type AdjustFinishTimeMutation = { __typename?: 'Mutation', adjustFinishTime: { __typename?: 'Clock', finish: Date | string, hold?: Date | string | null, start: Date | string } };

export type AdjustStartTimeMutationVariables = Exact<{
  startTime: Scalars['DateTime']['input'];
  pushEndTime?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type AdjustStartTimeMutation = { __typename?: 'Mutation', adjustStartTime: { __typename?: 'Clock', finish: Date | string, hold?: Date | string | null, start: Date | string } };

export type ClockSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ClockSubscriptionSubscription = { __typename?: 'Subscription', clock: { __typename?: 'Clock', finish: Date | string, hold?: Date | string | null, start: Date | string } };

export type CompetitionDetailsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type CompetitionDetailsQueryQuery = { __typename?: 'Query', competition: { __typename?: 'Competition', name: string, instructions: string, brief: string } };

export type CreateTeamMutationVariables = Exact<{
  name: Scalars['String']['input'];
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CreateTeamMutation = { __typename?: 'Mutation', createTeam: { __typename?: 'Team', id: number, name: string } };

export type CreateUserMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
  teamId?: InputMaybe<Scalars['Int']['input']>;
  role: UserRole;
  name: Scalars['String']['input'];
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', name: string, id: number, username: string, teamId?: number | null, role: UserRole } };

export type DeleteTeamMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteTeamMutation = { __typename?: 'Mutation', deleteTeam: { __typename?: 'Team', id: number, name: string } };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: { __typename?: 'User', id: number, name: string, username: string, role: UserRole } };

export type EditUserTeamMutationVariables = Exact<{
  userId: Scalars['Int']['input'];
  teamId?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<UserRole>;
}>;


export type EditUserTeamMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: number, username: string, role: UserRole, teamId?: number | null } };

export type HoldClockMutationVariables = Exact<{ [key: string]: never; }>;


export type HoldClockMutation = { __typename?: 'Mutation', holdClock: { __typename?: 'Clock', finish: Date | string, hold?: Date | string | null, start: Date | string } };

export type LeaderboardSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type LeaderboardSubscriptionSubscription = { __typename?: 'Subscription', scoreboard: Array<{ __typename?: 'ScoreboardRow', points: number, penalty: number, teamId: number, team: { __typename?: 'Team', name: string }, problems: Array<{ __typename?: 'ProblemScore', solved: boolean, slug: string, problem: { __typename?: 'Problem', icon: string, name: string } }> }> };

export type LoginMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'User', username: string, role: UserRole } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type MeQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQueryQuery = { __typename?: 'Query', me?: { __typename?: 'User', username: string, role: UserRole } | null };

export type ProblemDetailsQueryQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type ProblemDetailsQueryQuery = { __typename?: 'Query', problem: { __typename?: 'Problem', slug: string, name: string, solved?: boolean | null, points: number, difficulty: number, fuzz?: string | null, instructions?: string | null } };

export type ProblemListQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type ProblemListQueryQuery = { __typename?: 'Query', problems: Array<{ __typename?: 'Problem', slug: string, name: string, icon: string, solved?: boolean | null, points: number, difficulty: number }> };

export type RegisterMutationVariables = Exact<{
  name: Scalars['String']['input'];
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'User', username: string, role: UserRole } };

export type ReleaseClockMutationVariables = Exact<{
  extendDuration?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type ReleaseClockMutation = { __typename?: 'Mutation', releaseClock: { __typename?: 'Clock', finish: Date | string, hold?: Date | string | null, start: Date | string } };

export type ReleaseResultsMutationVariables = Exact<{ [key: string]: never; }>;


export type ReleaseResultsMutation = { __typename?: 'Mutation', releaseResults: { __typename?: 'Clock', finish: Date | string, hold?: Date | string | null, start: Date | string } };

export type SubmissionQueryQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type SubmissionQueryQuery = { __typename?: 'Query', submission?: { __typename?: 'Submission', ok?: boolean | null, out?: string | null, time: Date | string, vler?: string | null, code?: string | null, teamId: number, problemSlug: string } | null };

export type SubmissionsQueryQueryVariables = Exact<{
  problemSlug?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SubmissionsQueryQuery = { __typename?: 'Query', submissions: Array<{ __typename?: 'Submission', id: number, ok?: boolean | null, problemSlug: string, teamId: number, time: Date | string }> };

export type SubmitProblemMutationVariables = Exact<{
  code: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  output: Scalars['String']['input'];
}>;


export type SubmitProblemMutation = { __typename?: 'Mutation', judge: { __typename: 'JudgeErrorOutput', message: string, errors: string } | { __typename: 'JudgeSuccessOutput', message: string } };

export type TeamProblemFuzzQueryVariables = Exact<{
  teamId: Scalars['Int']['input'];
  slug: Scalars['String']['input'];
}>;


export type TeamProblemFuzzQuery = { __typename?: 'Query', problem: { __typename?: 'Problem', fuzz?: string | null } };

export type TeamQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type TeamQueryQuery = { __typename?: 'Query', teams: Array<{ __typename?: 'Team', name: string, id: number, seed: string, hidden: boolean }> };

export type UserListQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type UserListQueryQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: number, username: string, role: UserRole, name: string, team?: { __typename?: 'Team', id: number, name: string } | null }> };


export const AdjustFinishTimeDocument = `
    mutation AdjustFinishTime($endTime: DateTime!) {
  adjustFinishTime(finishTime: $endTime) {
    finish
    hold
    start
  }
}
    `;
export const AdjustStartTimeDocument = `
    mutation AdjustStartTime($startTime: DateTime!, $pushEndTime: Boolean) {
  adjustStartTime(startTime: $startTime, keepDuration: $pushEndTime) {
    finish
    hold
    start
  }
}
    `;
export const ClockSubscriptionDocument = `
    subscription ClockSubscription {
  clock {
    finish
    hold
    start
  }
}
    `;
export const CompetitionDetailsQueryDocument = `
    query CompetitionDetailsQuery {
  competition {
    name
    instructions
    brief
  }
}
    `;
export const CreateTeamDocument = `
    mutation CreateTeam($name: String!, $hidden: Boolean) {
  createTeam(name: $name, hidden: $hidden) {
    id
    name
  }
}
    `;
export const CreateUserDocument = `
    mutation CreateUser($username: String!, $password: String!, $teamId: Int, $role: UserRole!, $name: String!) {
  createUser(
    username: $username
    teamId: $teamId
    role: $role
    password: $password
    name: $name
  ) {
    name
    id
    username
    teamId
    role
  }
}
    `;
export const DeleteTeamDocument = `
    mutation DeleteTeam($id: Int!) {
  deleteTeam(id: $id) {
    id
    name
  }
}
    `;
export const DeleteUserDocument = `
    mutation DeleteUser($id: Int!) {
  deleteUser(id: $id) {
    id
    name
    username
    role
  }
}
    `;
export const EditUserTeamDocument = `
    mutation EditUserTeam($userId: Int!, $teamId: Int, $role: UserRole) {
  updateUser(teamId: $teamId, id: $userId, role: $role) {
    id
    username
    role
    teamId
  }
}
    `;
export const HoldClockDocument = `
    mutation HoldClock {
  holdClock {
    finish
    hold
    start
  }
}
    `;
export const LeaderboardSubscriptionDocument = `
    subscription LeaderboardSubscription {
  scoreboard {
    points
    penalty
    teamId
    team {
      name
    }
    problems {
      solved
      slug
      problem {
        icon
        name
      }
    }
  }
}
    `;
export const LoginDocument = `
    mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    username
    role
  }
}
    `;
export const LogoutDocument = `
    mutation Logout {
  logout
}
    `;
export const MeQueryDocument = `
    query MeQuery {
  me {
    username
    role
  }
}
    `;
export const ProblemDetailsQueryDocument = `
    query ProblemDetailsQuery($slug: String!) {
  problem(slug: $slug) {
    slug
    name
    solved
    points
    difficulty
    fuzz
    instructions
  }
}
    `;
export const ProblemListQueryDocument = `
    query ProblemListQuery {
  problems {
    slug
    name
    icon
    solved
    points
    difficulty
  }
}
    `;
export const RegisterDocument = `
    mutation Register($name: String!, $username: String!, $password: String!) {
  register(username: $username, password: $password, name: $name) {
    username
    role
  }
}
    `;
export const ReleaseClockDocument = `
    mutation ReleaseClock($extendDuration: Boolean) {
  releaseClock(extendDuration: $extendDuration) {
    finish
    hold
    start
  }
}
    `;
export const ReleaseResultsDocument = `
    mutation ReleaseResults {
  releaseResults {
    finish
    hold
    start
  }
}
    `;
export const SubmissionQueryDocument = `
    query SubmissionQuery($id: Int!) {
  submission(id: $id) {
    ok
    out
    time
    vler
    code
    teamId
    problemSlug
  }
}
    `;
export const SubmissionsQueryDocument = `
    query SubmissionsQuery($problemSlug: String, $teamId: Int) {
  submissions(problemSlug: $problemSlug, teamId: $teamId) {
    id
    ok
    problemSlug
    teamId
    time
  }
}
    `;
export const SubmitProblemDocument = `
    mutation SubmitProblem($code: String!, $slug: String!, $output: String!) {
  judge(code: $code, slug: $slug, output: $output) {
    __typename
    ... on JudgeErrorOutput {
      message
      errors
    }
    ... on JudgeSuccessOutput {
      message
    }
  }
}
    `;
export const TeamProblemFuzzDocument = `
    query TeamProblemFuzz($teamId: Int!, $slug: String!) {
  problem(slug: $slug) {
    fuzz(teamId: $teamId)
  }
}
    `;
export const TeamQueryDocument = `
    query TeamQuery {
  teams {
    name
    id
    seed
    hidden
  }
}
    `;
export const UserListQueryDocument = `
    query UserListQuery {
  users {
    id
    username
    role
    name
    team {
      id
      name
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    AdjustFinishTime(variables: AdjustFinishTimeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: AdjustFinishTimeMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<AdjustFinishTimeMutation>(AdjustFinishTimeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AdjustFinishTime', 'mutation', variables);
    },
    AdjustStartTime(variables: AdjustStartTimeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: AdjustStartTimeMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<AdjustStartTimeMutation>(AdjustStartTimeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AdjustStartTime', 'mutation', variables);
    },
    ClockSubscription(variables?: ClockSubscriptionSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: ClockSubscriptionSubscription; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<ClockSubscriptionSubscription>(ClockSubscriptionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ClockSubscription', 'subscription', variables);
    },
    CompetitionDetailsQuery(variables?: CompetitionDetailsQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: CompetitionDetailsQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<CompetitionDetailsQueryQuery>(CompetitionDetailsQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CompetitionDetailsQuery', 'query', variables);
    },
    CreateTeam(variables: CreateTeamMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: CreateTeamMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<CreateTeamMutation>(CreateTeamDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CreateTeam', 'mutation', variables);
    },
    CreateUser(variables: CreateUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: CreateUserMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<CreateUserMutation>(CreateUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CreateUser', 'mutation', variables);
    },
    DeleteTeam(variables: DeleteTeamMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: DeleteTeamMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<DeleteTeamMutation>(DeleteTeamDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'DeleteTeam', 'mutation', variables);
    },
    DeleteUser(variables: DeleteUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: DeleteUserMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<DeleteUserMutation>(DeleteUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'DeleteUser', 'mutation', variables);
    },
    EditUserTeam(variables: EditUserTeamMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: EditUserTeamMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<EditUserTeamMutation>(EditUserTeamDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'EditUserTeam', 'mutation', variables);
    },
    HoldClock(variables?: HoldClockMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: HoldClockMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<HoldClockMutation>(HoldClockDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'HoldClock', 'mutation', variables);
    },
    LeaderboardSubscription(variables?: LeaderboardSubscriptionSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: LeaderboardSubscriptionSubscription; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<LeaderboardSubscriptionSubscription>(LeaderboardSubscriptionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'LeaderboardSubscription', 'subscription', variables);
    },
    Login(variables: LoginMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: LoginMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<LoginMutation>(LoginDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Login', 'mutation', variables);
    },
    Logout(variables?: LogoutMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: LogoutMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<LogoutMutation>(LogoutDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Logout', 'mutation', variables);
    },
    MeQuery(variables?: MeQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: MeQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<MeQueryQuery>(MeQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'MeQuery', 'query', variables);
    },
    ProblemDetailsQuery(variables: ProblemDetailsQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: ProblemDetailsQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<ProblemDetailsQueryQuery>(ProblemDetailsQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ProblemDetailsQuery', 'query', variables);
    },
    ProblemListQuery(variables?: ProblemListQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: ProblemListQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<ProblemListQueryQuery>(ProblemListQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ProblemListQuery', 'query', variables);
    },
    Register(variables: RegisterMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: RegisterMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<RegisterMutation>(RegisterDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Register', 'mutation', variables);
    },
    ReleaseClock(variables?: ReleaseClockMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: ReleaseClockMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<ReleaseClockMutation>(ReleaseClockDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ReleaseClock', 'mutation', variables);
    },
    ReleaseResults(variables?: ReleaseResultsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: ReleaseResultsMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<ReleaseResultsMutation>(ReleaseResultsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ReleaseResults', 'mutation', variables);
    },
    SubmissionQuery(variables: SubmissionQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: SubmissionQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<SubmissionQueryQuery>(SubmissionQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SubmissionQuery', 'query', variables);
    },
    SubmissionsQuery(variables?: SubmissionsQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: SubmissionsQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<SubmissionsQueryQuery>(SubmissionsQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SubmissionsQuery', 'query', variables);
    },
    SubmitProblem(variables: SubmitProblemMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: SubmitProblemMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<SubmitProblemMutation>(SubmitProblemDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SubmitProblem', 'mutation', variables);
    },
    TeamProblemFuzz(variables: TeamProblemFuzzQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: TeamProblemFuzzQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<TeamProblemFuzzQuery>(TeamProblemFuzzDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'TeamProblemFuzz', 'query', variables);
    },
    TeamQuery(variables?: TeamQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: TeamQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<TeamQueryQuery>(TeamQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'TeamQuery', 'query', variables);
    },
    UserListQuery(variables?: UserListQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: UserListQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<UserListQueryQuery>(UserListQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UserListQuery', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;