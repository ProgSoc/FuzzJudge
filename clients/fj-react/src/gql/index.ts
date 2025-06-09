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
  overrideJudge: Submission;
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
  logn: Scalars['String']['input'];
  role: UserRole;
  teamId?: InputMaybe<Scalars['Int']['input']>;
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


export type MutationOverrideJudgeArgs = {
  solved: Scalars['Boolean']['input'];
  submissionId: Scalars['Int']['input'];
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
  logn: Scalars['String']['output'];
  role: UserRole;
  team?: Maybe<Team>;
  teamId?: Maybe<Scalars['Int']['output']>;
};

export enum UserRole {
  Admin = 'admin',
  Competitor = 'competitor'
}

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
  teamId?: InputMaybe<Scalars['Int']['input']>;
  role: UserRole;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: number, logn: string, teamId?: number | null, role: UserRole } };

export type LeaderboardSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type LeaderboardSubscriptionSubscription = { __typename?: 'Subscription', scoreboard: Array<{ __typename?: 'ScoreboardRow', points: number, penalty: number, teamId: number, team: { __typename?: 'Team', name: string }, problems: Array<{ __typename?: 'ProblemScore', solved: boolean, slug: string, problem: { __typename?: 'Problem', icon: string, name: string } }> }> };

export type MeQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQueryQuery = { __typename?: 'Query', me?: { __typename?: 'User', logn: string, role: UserRole } | null };

export type ProblemDetailsQueryQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type ProblemDetailsQueryQuery = { __typename?: 'Query', problem: { __typename?: 'Problem', slug: string, name: string, solved?: boolean | null, points: number, difficulty: number, fuzz?: string | null, instructions?: string | null } };

export type ProblemListQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type ProblemListQueryQuery = { __typename?: 'Query', problems: Array<{ __typename?: 'Problem', slug: string, name: string, icon: string, solved?: boolean | null, points: number, difficulty: number }> };

export type SubmissionsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type SubmissionsQueryQuery = { __typename?: 'Query', submissions: Array<{ __typename?: 'Submission', id: number, ok?: boolean | null, problemSlug: string, teamId: number, time: Date | string }> };

export type TeamQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type TeamQueryQuery = { __typename?: 'Query', teams: Array<{ __typename?: 'Team', name: string, id: number, seed: string, hidden: boolean }> };

export type UserListQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type UserListQueryQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: number, logn: string, role: UserRole, teamId?: number | null }> };


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
    mutation CreateUser($username: String!, $teamId: Int, $role: UserRole!) {
  createUser(logn: $username, teamId: $teamId, role: $role) {
    id
    logn
    teamId
    role
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
export const MeQueryDocument = `
    query MeQuery {
  me {
    logn
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
export const SubmissionsQueryDocument = `
    query SubmissionsQuery {
  submissions {
    id
    ok
    problemSlug
    teamId
    time
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
    logn
    role
    teamId
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
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
    LeaderboardSubscription(variables?: LeaderboardSubscriptionSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: LeaderboardSubscriptionSubscription; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<LeaderboardSubscriptionSubscription>(LeaderboardSubscriptionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'LeaderboardSubscription', 'subscription', variables);
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
    SubmissionsQuery(variables?: SubmissionsQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: SubmissionsQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<SubmissionsQueryQuery>(SubmissionsQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SubmissionsQuery', 'query', variables);
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