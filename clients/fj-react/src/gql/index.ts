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

export type AdjustFinishTimeMutationVariables = Exact<{
  endTime: Scalars['DateTime']['input'];
}>;


export type AdjustFinishTimeMutation = { __typename?: 'Mutation', adjustFinishTime: { __typename?: 'Clock', finish: Date | string, hold?: Date | string | null, start: Date | string } };

export type AdjustStartTimeMutationVariables = Exact<{
  startTime: Scalars['DateTime']['input'];
  pushEndTime?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type AdjustStartTimeMutation = { __typename?: 'Mutation', adjustStartTime: { __typename?: 'Clock', finish: Date | string, hold?: Date | string | null, start: Date | string } };

export type BroadcastSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type BroadcastSubscriptionSubscription = { __typename?: 'Subscription', broadcasts: { __typename?: 'Broadcast', id: string, content: string, title: string } };

export type ClockSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ClockSubscriptionSubscription = { __typename?: 'Subscription', clock: { __typename?: 'Clock', finish: Date | string, hold?: Date | string | null, start: Date | string } };

export type CompetitionDetailsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type CompetitionDetailsQueryQuery = { __typename?: 'Query', competition: { __typename?: 'Competition', name: string, instructions: string } };

export type CreateBroadcastMutationVariables = Exact<{
  title: Scalars['String']['input'];
  content: Scalars['String']['input'];
}>;


export type CreateBroadcastMutation = { __typename?: 'Mutation', createBroadcast: { __typename?: 'Broadcast', id: string, title: string, content: string } };

export type CreateTeamMutationVariables = Exact<{
  name: Scalars['String']['input'];
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CreateTeamMutation = { __typename?: 'Mutation', createTeam: { __typename?: 'Team', id: string, name: string } };

export type CreateUserMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
  teamId?: InputMaybe<Scalars['ID']['input']>;
  role: UserRole;
  name: Scalars['String']['input'];
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', name: string, id: string, username: string, teamId?: string | null, role: UserRole } };

export type DeleteTeamMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTeamMutation = { __typename?: 'Mutation', deleteTeam: { __typename?: 'Team', id: string, name: string } };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: { __typename?: 'User', id: string, name: string, username: string, role: UserRole } };

export type HoldClockMutationVariables = Exact<{ [key: string]: never; }>;


export type HoldClockMutation = { __typename?: 'Mutation', holdClock: { __typename?: 'Clock', finish: Date | string, hold?: Date | string | null, start: Date | string } };

export type LeaderboardSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type LeaderboardSubscriptionSubscription = { __typename?: 'Subscription', scoreboard: Array<{ __typename?: 'ScoreboardRow', rank: number, points: number, penalty: number, teamId: string, team: { __typename?: 'Team', name: string }, problems: Array<{ __typename?: 'ProblemScore', solved: boolean, slug: string, problem: { __typename?: 'Problem', icon: string, name: string } }> }> };

export type LoginMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'User', username: string, role: UserRole } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type MeQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQueryQuery = { __typename?: 'Query', me?: { __typename?: 'User', username: string, role: UserRole } | null };

export type OverrideSubmissionMutationVariables = Exact<{
  submissionId: Scalars['ID']['input'];
  solved: Scalars['Boolean']['input'];
}>;


export type OverrideSubmissionMutation = { __typename?: 'Mutation', overrideJudge: { __typename?: 'Submission', id: string } };

export type ProblemDetailsQueryQueryVariables = Exact<{
  slug: Scalars['ID']['input'];
}>;


export type ProblemDetailsQueryQuery = { __typename?: 'Query', problem: { __typename?: 'Problem', slug: string, name: string, solved?: boolean | null, points: number, difficulty: number, fuzz: string, instructions: string } };

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
  id: Scalars['ID']['input'];
}>;


export type SubmissionQueryQuery = { __typename?: 'Query', submission?: { __typename?: 'Submission', ok?: boolean | null, out?: string | null, time: Date | string, vler?: string | null, code?: string | null, teamId: string, problemSlug: string } | null };

export type SubmissionsQueryQueryVariables = Exact<{
  problemSlug?: InputMaybe<Scalars['ID']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type SubmissionsQueryQuery = { __typename?: 'Query', submissions: Array<{ __typename?: 'Submission', id: string, ok?: boolean | null, problemSlug: string, teamId: string, time: Date | string }> };

export type SubmitProblemMutationVariables = Exact<{
  code: Scalars['String']['input'];
  slug: Scalars['ID']['input'];
  output: Scalars['String']['input'];
}>;


export type SubmitProblemMutation = { __typename?: 'Mutation', judge: { __typename: 'JudgeErrorOutput', message: string, errors: string } | { __typename: 'JudgeSuccessOutput', message: string } };

export type TeamProblemFuzzQueryVariables = Exact<{
  teamId: Scalars['ID']['input'];
  slug: Scalars['ID']['input'];
}>;


export type TeamProblemFuzzQuery = { __typename?: 'Query', problem: { __typename?: 'Problem', fuzz: string } };

export type TeamQueryQueryVariables = Exact<{
  teamId: Scalars['ID']['input'];
}>;


export type TeamQueryQuery = { __typename?: 'Query', team: { __typename?: 'Team', id: string, name: string, hidden: boolean } };

export type TeamsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type TeamsQueryQuery = { __typename?: 'Query', teams: Array<{ __typename?: 'Team', name: string, id: string, seed: string, hidden: boolean }> };

export type UpdateTeamMutationVariables = Exact<{
  teamId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UpdateTeamMutation = { __typename?: 'Mutation', updateTeam: { __typename?: 'Team', id: string } };

export type UpdateUserMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  teamId?: InputMaybe<Scalars['ID']['input']>;
  role?: InputMaybe<UserRole>;
  username?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, username: string, role: UserRole, teamId?: string | null } };

export type UserListQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type UserListQueryQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, username: string, role: UserRole, name: string, team?: { __typename?: 'Team', id: string, name: string } | null }> };

export type UserQueryQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserQueryQuery = { __typename?: 'Query', user: { __typename?: 'User', id: string, name: string, role: UserRole, username: string, team?: { __typename?: 'Team', id: string, name: string } | null } };


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
export const BroadcastSubscriptionDocument = `
    subscription BroadcastSubscription {
  broadcasts {
    id
    content
    title
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
  }
}
    `;
export const CreateBroadcastDocument = `
    mutation CreateBroadcast($title: String!, $content: String!) {
  createBroadcast(title: $title, content: $content) {
    id
    title
    content
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
    mutation CreateUser($username: String!, $password: String!, $teamId: ID, $role: UserRole!, $name: String!) {
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
    mutation DeleteTeam($id: ID!) {
  deleteTeam(id: $id) {
    id
    name
  }
}
    `;
export const DeleteUserDocument = `
    mutation DeleteUser($id: ID!) {
  deleteUser(id: $id) {
    id
    name
    username
    role
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
    rank
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
export const OverrideSubmissionDocument = `
    mutation OverrideSubmission($submissionId: ID!, $solved: Boolean!) {
  overrideJudge(submissionId: $submissionId, solved: $solved) {
    id
  }
}
    `;
export const ProblemDetailsQueryDocument = `
    query ProblemDetailsQuery($slug: ID!) {
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
    query SubmissionQuery($id: ID!) {
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
    query SubmissionsQuery($problemSlug: ID, $teamId: ID) {
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
    mutation SubmitProblem($code: String!, $slug: ID!, $output: String!) {
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
    query TeamProblemFuzz($teamId: ID!, $slug: ID!) {
  problem(slug: $slug) {
    fuzz(teamId: $teamId)
  }
}
    `;
export const TeamQueryDocument = `
    query TeamQuery($teamId: ID!) {
  team(id: $teamId) {
    id
    name
    hidden
  }
}
    `;
export const TeamsQueryDocument = `
    query TeamsQuery {
  teams {
    name
    id
    seed
    hidden
  }
}
    `;
export const UpdateTeamDocument = `
    mutation UpdateTeam($teamId: ID!, $name: String, $hidden: Boolean) {
  updateTeam(id: $teamId, name: $name, hidden: $hidden) {
    id
  }
}
    `;
export const UpdateUserDocument = `
    mutation UpdateUser($userId: ID!, $teamId: ID, $role: UserRole, $username: String, $name: String, $password: String) {
  updateUser(
    teamId: $teamId
    id: $userId
    role: $role
    name: $name
    username: $username
    password: $password
  ) {
    id
    username
    role
    teamId
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
export const UserQueryDocument = `
    query UserQuery($id: ID!) {
  user(id: $id) {
    id
    name
    role
    team {
      id
      name
    }
    username
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
    BroadcastSubscription(variables?: BroadcastSubscriptionSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: BroadcastSubscriptionSubscription; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<BroadcastSubscriptionSubscription>(BroadcastSubscriptionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'BroadcastSubscription', 'subscription', variables);
    },
    ClockSubscription(variables?: ClockSubscriptionSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: ClockSubscriptionSubscription; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<ClockSubscriptionSubscription>(ClockSubscriptionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ClockSubscription', 'subscription', variables);
    },
    CompetitionDetailsQuery(variables?: CompetitionDetailsQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: CompetitionDetailsQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<CompetitionDetailsQueryQuery>(CompetitionDetailsQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CompetitionDetailsQuery', 'query', variables);
    },
    CreateBroadcast(variables: CreateBroadcastMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: CreateBroadcastMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<CreateBroadcastMutation>(CreateBroadcastDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CreateBroadcast', 'mutation', variables);
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
    OverrideSubmission(variables: OverrideSubmissionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: OverrideSubmissionMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<OverrideSubmissionMutation>(OverrideSubmissionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'OverrideSubmission', 'mutation', variables);
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
    TeamQuery(variables: TeamQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: TeamQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<TeamQueryQuery>(TeamQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'TeamQuery', 'query', variables);
    },
    TeamsQuery(variables?: TeamsQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: TeamsQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<TeamsQueryQuery>(TeamsQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'TeamsQuery', 'query', variables);
    },
    UpdateTeam(variables: UpdateTeamMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: UpdateTeamMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<UpdateTeamMutation>(UpdateTeamDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateTeam', 'mutation', variables);
    },
    UpdateUser(variables: UpdateUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: UpdateUserMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<UpdateUserMutation>(UpdateUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateUser', 'mutation', variables);
    },
    UserListQuery(variables?: UserListQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: UserListQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<UserListQueryQuery>(UserListQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UserListQuery', 'query', variables);
    },
    UserQuery(variables: UserQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: UserQueryQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<UserQueryQuery>(UserQueryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UserQuery', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;