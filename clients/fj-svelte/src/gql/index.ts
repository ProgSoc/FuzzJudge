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

export type Broadcast = {
  __typename?: 'Broadcast';
  /** The content of the broadcast. */
  content: Scalars['String']['output'];
  /** The randomly generated ID of the broadcast. */
  id: Scalars['ID']['output'];
  /** The title of the broadcast */
  title: Scalars['String']['output'];
};

export type Clock = {
  __typename?: 'Clock';
  /** The finish time of the competition clock */
  finish: Scalars['DateTime']['output'];
  /** The datetime when the clock was put on hold. */
  hold?: Maybe<Scalars['DateTime']['output']>;
  /** The start time of the competition clock. */
  start: Scalars['DateTime']['output'];
};

export type Competition = {
  __typename?: 'Competition';
  /** The description of the competition */
  instructions: Scalars['String']['output'];
  /** The name of the competition */
  name: Scalars['String']['output'];
};

export type JudgeErrorOutput = {
  __typename?: 'JudgeErrorOutput';
  /** Additional errors to help diagnose the issue. */
  errors: Scalars['String']['output'];
  /** An error message indicating what went wrong during the judge operation. */
  message: Scalars['String']['output'];
};

export type JudgeOutput = JudgeErrorOutput | JudgeSuccessOutput;

export type JudgeSuccessOutput = {
  __typename?: 'JudgeSuccessOutput';
  /** A message indicating the success of the judge operation. */
  message: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Adjust the finish time of the competition clock. */
  adjustFinishTime: Clock;
  /** Adjust the start time of the competition clock. */
  adjustStartTime: Clock;
  /**
   * Create a new broadcast with a title and content.
   * This can be used to announce important information to all users.
   */
  createBroadcast: Broadcast;
  /** Create a new team with a name and an optional hidden status. */
  createTeam: Team;
  /** Create a new user with a name, username, password, role, and optional team ID. */
  createUser: User;
  /** Delete a team by it's ID. */
  deleteTeam: Team;
  /** Delete a user by their ID. */
  deleteUser: User;
  /** Get a team's fuzz for a specific problem */
  getAdminFuzz: Scalars['String']['output'];
  /**
   * Pause the competition clock.
   * This can be used to temporarily stop the clock, for example during a break.
   */
  holdClock: Clock;
  /** Submit a solution to a problem. */
  judge: JudgeOutput;
  /** Login to an account with a username and password. */
  login: User;
  /** Logout the currently logged-in user. */
  logout: Scalars['Boolean']['output'];
  /** Override the judgement of a submission */
  overrideJudge: Submission;
  /** Register a new user with a username, password, and name. */
  register: User;
  /** Resume the competition clock after it has been put on hold. */
  releaseClock: Clock;
  /** Release the results for after the Competition ends. */
  releaseResults: Clock;
  /**
   * Update an existing team by its ID.
   * You can change the name and hidden status of the team.
   */
  updateTeam: Team;
  /** Update an existing user by their ID. */
  updateUser: User;
};


export type MutationAdjustFinishTimeArgs = {
  finishTime: Scalars['DateTime']['input'];
};


export type MutationAdjustStartTimeArgs = {
  keepDuration?: InputMaybe<Scalars['Boolean']['input']>;
  startTime: Scalars['DateTime']['input'];
};


export type MutationCreateBroadcastArgs = {
  content: Scalars['String']['input'];
  title: Scalars['String']['input'];
};


export type MutationCreateTeamArgs = {
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateUserArgs = {
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: UserRole;
  teamId?: InputMaybe<Scalars['ID']['input']>;
  username: Scalars['String']['input'];
};


export type MutationDeleteTeamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationGetAdminFuzzArgs = {
  slug: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type MutationJudgeArgs = {
  code: Scalars['String']['input'];
  output: Scalars['String']['input'];
  slug: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationOverrideJudgeArgs = {
  solved: Scalars['Boolean']['input'];
  submissionId: Scalars['ID']['input'];
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
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type Problem = {
  __typename?: 'Problem';
  /**
   * The difficulty level of the problem, represented as an integer from 0 to 3.
   * Tutorials are 0, easy problems are 1, medium problems are 2, and hard problems are 3.
   */
  difficulty: Scalars['Int']['output'];
  /**
   * Get the fuzz for a specific team.
   * This is used to provide a unique identifier for the team to use in their solution.
   */
  fuzz: Scalars['String']['output'];
  /** A single emoji that represents the problem. */
  icon: Scalars['String']['output'];
  /** The instructions for the problem, contextualizing the problem and providing necessary details. */
  instructions: Scalars['String']['output'];
  /** The name of the problem. */
  name: Scalars['String']['output'];
  /** The number of points awarded for solving the problem. */
  points: Scalars['Int']['output'];
  /** The unique identifier for the problem, suitable for use in urls. */
  slug: Scalars['ID']['output'];
  /** The status of whether the problem has been solved by the team. */
  solved?: Maybe<Scalars['Boolean']['output']>;
};


export type ProblemFuzzArgs = {
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type ProblemScore = {
  __typename?: 'ProblemScore';
  /** The total penalty time for the problem. */
  penalty: Scalars['Float']['output'];
  /** The number of points awarded for solving the problem. */
  points: Scalars['Int']['output'];
  /** The problem that the score is linked to. */
  problem: Problem;
  /** The slug of the problem, suitable for use in URLs. */
  slug: Scalars['ID']['output'];
  /** Whether the problem has been solved by the team. */
  solved: Scalars['Boolean']['output'];
  /** The number of attempts made by the team to solve the problem. */
  tries: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Fetch the current competition details. */
  competition: Competition;
  /** The liscense under which the application is distributed. */
  header: Scalars['String']['output'];
  /** Get the currently logged-in user. */
  me?: Maybe<User>;
  /** Get a specific problem by its slug */
  problem: Problem;
  /** Get a list of all problems */
  problems: Array<Problem>;
  /** Get a specific submission by its ID */
  submission?: Maybe<Submission>;
  /** List all submissions */
  submissions: Array<Submission>;
  /** Get a specific team by it's ID. */
  team: Team;
  /** Fetch a list of all teams. */
  teams: Array<Team>;
  /** Get a specific user by their ID. */
  user: User;
  /** Get a list of all users in the system. */
  users: Array<User>;
  /** Fetch the current version of the application. */
  version: Scalars['String']['output'];
};


export type QueryProblemArgs = {
  slug: Scalars['ID']['input'];
};


export type QuerySubmissionArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySubmissionsArgs = {
  problemSlug?: InputMaybe<Scalars['ID']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryTeamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type ScoreboardRow = {
  __typename?: 'ScoreboardRow';
  /** The total penalty time for the team */
  penalty: Scalars['Float']['output'];
  /** The total points scored by the team */
  points: Scalars['Int']['output'];
  /** The list of problems, number of tries, and scores for each problem */
  problems: Array<ProblemScore>;
  /** The rank of the team on the scoreboard */
  rank: Scalars['Int']['output'];
  /** The team that this row is linked to */
  team: Team;
  /** The Id of the team */
  teamId: Scalars['ID']['output'];
};

export type Submission = {
  __typename?: 'Submission';
  /** The source code submitted with the solution. */
  code?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the submission. */
  id: Scalars['ID']['output'];
  /** The result of the submission, indicating whether it was successful or not. */
  ok?: Maybe<Scalars['Boolean']['output']>;
  /** The output of the submission, if any. */
  out?: Maybe<Scalars['String']['output']>;
  /** The problem that was attempted in the submission. */
  problem: Problem;
  /** The slug of the problem that the submission is for. */
  problemSlug: Scalars['ID']['output'];
  /** The team that made the submission. */
  team: Team;
  /** The ID of the team that made the submission. */
  teamId: Scalars['ID']['output'];
  /** The time that the submission was made. */
  time: Scalars['DateTime']['output'];
  /** The error output of the submission */
  vler?: Maybe<Scalars['String']['output']>;
  /** The amount of time taken the process the submission using the fuzzer. */
  vlms?: Maybe<Scalars['Float']['output']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscribe to receive updates about broadcasts and annoucements. */
  broadcasts: Broadcast;
  /** Subscribe to updates about the competition clock updates. */
  clock: Clock;
  /** Subscribe to updates about the scoreboard. */
  scoreboard: Array<ScoreboardRow>;
};

export type Team = {
  __typename?: 'Team';
  /** Whether the team is hidden from the scoreboard. */
  hidden: Scalars['Boolean']['output'];
  /** The unique identifier for the team. */
  id: Scalars['ID']['output'];
  /** The members of the team. */
  members: Array<User>;
  /** The name of the team. */
  name: Scalars['String']['output'];
  /** The randomly generated seed for the team, used for fuzzing. */
  seed: Scalars['String']['output'];
  /** The submissions linked to the team */
  submissions: Array<Submission>;
};


export type TeamSubmissionsArgs = {
  problemSlug?: InputMaybe<Scalars['ID']['input']>;
};

export type User = {
  __typename?: 'User';
  /** The unique identifier for the user. */
  id: Scalars['ID']['output'];
  /** The name of the user. (Full name or display name) */
  name: Scalars['String']['output'];
  /** The role of the user */
  role: UserRole;
  /** The team that the user is associated with, if any. */
  team?: Maybe<Team>;
  /** The ID of the team that the user is associated with, if any. */
  teamId?: Maybe<Scalars['ID']['output']>;
  /** The username of the user, used for login. */
  username: Scalars['String']['output'];
};

export enum UserRole {
  /** Administrator with elevated privileges, can manage users and teams. */
  Admin = 'admin',
  /** Regular user, typically a competitor in the competition. */
  Competitor = 'competitor'
}

export type BroadcastSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type BroadcastSubscription = { __typename?: 'Subscription', broadcasts: { __typename?: 'Broadcast', id: string, title: string, content: string } };

export type ClockSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ClockSubscriptionSubscription = { __typename?: 'Subscription', clock: { __typename?: 'Clock', start: Date | string, finish: Date | string, hold?: Date | string | null } };

export type CompetitionDataQueryVariables = Exact<{ [key: string]: never; }>;


export type CompetitionDataQuery = { __typename?: 'Query', competition: { __typename?: 'Competition', name: string, instructions: string } };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', me?: { __typename?: 'User', username: string } | null };

export type JudgeSubmissionMutationVariables = Exact<{
  problemSlug: Scalars['ID']['input'];
  code: Scalars['String']['input'];
  output: Scalars['String']['input'];
}>;


export type JudgeSubmissionMutation = { __typename?: 'Mutation', judge: { __typename: 'JudgeErrorOutput', message: string, errors: string } | { __typename: 'JudgeSuccessOutput', message: string } };

export type LoginMutationVariables = Exact<{
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'User', username: string } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type ProblemDataQueryVariables = Exact<{
  problemSlug: Scalars['ID']['input'];
}>;


export type ProblemDataQuery = { __typename?: 'Query', problem: { __typename?: 'Problem', solved?: boolean | null, name: string, difficulty: number, points: number, instructions: string, fuzz: string } };

export type ProblemsListQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type ProblemsListQueryQuery = { __typename?: 'Query', problems: Array<{ __typename?: 'Problem', slug: string, icon: string, points: number, solved?: boolean | null, difficulty: number, name: string }> };

export type RegisterMutationVariables = Exact<{
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'User', username: string } };

export type ScoreboardSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ScoreboardSubscriptionSubscription = { __typename?: 'Subscription', scoreboard: Array<{ __typename?: 'ScoreboardRow', rank: number, points: number, penalty: number, team: { __typename?: 'Team', name: string }, problems: Array<{ __typename?: 'ProblemScore', points: number, penalty: number, tries: number, solved: boolean }> }> };


export const BroadcastDocument = `
    subscription Broadcast {
  broadcasts {
    id
    title
    content
  }
}
    `;
export const ClockSubscriptionDocument = `
    subscription ClockSubscription {
  clock {
    start
    finish
    hold
  }
}
    `;
export const CompetitionDataDocument = `
    query CompetitionData {
  competition {
    name
    instructions
  }
}
    `;
export const CurrentUserDocument = `
    query CurrentUser {
  me {
    username
  }
}
    `;
export const JudgeSubmissionDocument = `
    mutation JudgeSubmission($problemSlug: ID!, $code: String!, $output: String!) {
  judge(slug: $problemSlug, code: $code, output: $output) {
    __typename
    ... on JudgeSuccessOutput {
      message
    }
    ... on JudgeErrorOutput {
      message
      errors
    }
  }
}
    `;
export const LoginDocument = `
    mutation Login($password: String!, $username: String!) {
  login(password: $password, username: $username) {
    username
  }
}
    `;
export const LogoutDocument = `
    mutation Logout {
  logout
}
    `;
export const ProblemDataDocument = `
    query ProblemData($problemSlug: ID!) {
  problem(slug: $problemSlug) {
    solved
    name
    difficulty
    points
    instructions
    fuzz
  }
}
    `;
export const ProblemsListQueryDocument = `
    query ProblemsListQuery {
  problems {
    slug
    icon
    points
    solved
    difficulty
    name
  }
}
    `;
export const RegisterDocument = `
    mutation Register($name: String!, $password: String!, $username: String!) {
  register(name: $name, password: $password, username: $username) {
    username
  }
}
    `;
export const ScoreboardSubscriptionDocument = `
    subscription ScoreboardSubscription {
  scoreboard {
    rank
    team {
      name
    }
    points
    penalty
    problems {
      points
      penalty
      tries
      solved
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    Broadcast(variables?: BroadcastSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: BroadcastSubscription; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<BroadcastSubscription>(BroadcastDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Broadcast', 'subscription', variables);
    },
    ClockSubscription(variables?: ClockSubscriptionSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: ClockSubscriptionSubscription; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<ClockSubscriptionSubscription>(ClockSubscriptionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ClockSubscription', 'subscription', variables);
    },
    CompetitionData(variables?: CompetitionDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: CompetitionDataQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<CompetitionDataQuery>(CompetitionDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CompetitionData', 'query', variables);
    },
    CurrentUser(variables?: CurrentUserQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: CurrentUserQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<CurrentUserQuery>(CurrentUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CurrentUser', 'query', variables);
    },
    JudgeSubmission(variables: JudgeSubmissionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: JudgeSubmissionMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<JudgeSubmissionMutation>(JudgeSubmissionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'JudgeSubmission', 'mutation', variables);
    },
    Login(variables: LoginMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: LoginMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<LoginMutation>(LoginDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Login', 'mutation', variables);
    },
    Logout(variables?: LogoutMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: LogoutMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<LogoutMutation>(LogoutDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Logout', 'mutation', variables);
    },
    ProblemData(variables: ProblemDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: ProblemDataQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<ProblemDataQuery>(ProblemDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ProblemData', 'query', variables);
    },
    ProblemsListQuery(variables?: ProblemsListQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: ProblemsListQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<ProblemsListQueryQuery>(ProblemsListQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ProblemsListQuery', 'query', variables);
    },
    Register(variables: RegisterMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: RegisterMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<RegisterMutation>(RegisterDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Register', 'mutation', variables);
    },
    ScoreboardSubscription(variables?: ScoreboardSubscriptionSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: ScoreboardSubscriptionSubscription; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<ScoreboardSubscriptionSubscription>(ScoreboardSubscriptionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ScoreboardSubscription', 'subscription', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;