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
  me: User;
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

export type LeaderboardSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type LeaderboardSubscriptionSubscription = { __typename?: 'Subscription', scoreboard: Array<{ __typename?: 'ScoreboardRow', points: number, penalty: number, teamId: number, team: { __typename?: 'Team', name: string }, problems: Array<{ __typename?: 'ProblemScore', solved: boolean, slug: string }> }> };

export type MeQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', logn: string } };


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
    }
  }
}
    `;
export const MeQueryDocument = `
    query MeQuery {
  me {
    logn
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    LeaderboardSubscription(variables?: LeaderboardSubscriptionSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: LeaderboardSubscriptionSubscription; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<LeaderboardSubscriptionSubscription>(LeaderboardSubscriptionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'LeaderboardSubscription', 'subscription', variables);
    },
    MeQuery(variables?: MeQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: MeQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<MeQueryQuery>(MeQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'MeQuery', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;