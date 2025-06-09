import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { ProblemMapper } from './problems/schema.mappers';
import type { ProblemScoreMapper, ScoreboardRowMapper } from './scoreboard/schema.mappers';
import type { SubmissionMapper } from './submissions/schema.mappers';
import type { TeamMapper } from './teams/schema.mappers';
import type { UserMapper } from './users/schema.mappers';
import type { GraphQLContext, AuthenticatedContext } from '@/context';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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

export type ClockStatus =
  | 'after'
  | 'before'
  | 'freeze'
  | 'hold'
  | 'running';

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

export type UserRole =
  | 'admin'
  | 'competitor';



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
  JudgeOutput: ( JudgeErrorOutput & { __typename: 'JudgeErrorOutput' } ) | ( JudgeSuccessOutput & { __typename: 'JudgeSuccessOutput' } );
};


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Clock: ResolverTypeWrapper<Clock>;
  ClockStatus: ResolverTypeWrapper<'before' | 'after' | 'hold' | 'freeze' | 'running'>;
  Competition: ResolverTypeWrapper<Competition>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  File: ResolverTypeWrapper<Scalars['File']['output']>;
  JudgeErrorOutput: ResolverTypeWrapper<JudgeErrorOutput>;
  JudgeOutput: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['JudgeOutput']>;
  JudgeSuccessOutput: ResolverTypeWrapper<JudgeSuccessOutput>;
  Mutation: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Problem: ResolverTypeWrapper<ProblemMapper>;
  ProblemScore: ResolverTypeWrapper<ProblemScoreMapper>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Query: ResolverTypeWrapper<{}>;
  ScoreboardRow: ResolverTypeWrapper<ScoreboardRowMapper>;
  Submission: ResolverTypeWrapper<SubmissionMapper>;
  Subscription: ResolverTypeWrapper<{}>;
  Team: ResolverTypeWrapper<TeamMapper>;
  User: ResolverTypeWrapper<UserMapper>;
  UserRole: ResolverTypeWrapper<'competitor' | 'admin'>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Clock: Clock;
  Competition: Competition;
  String: Scalars['String']['output'];
  DateTime: Scalars['DateTime']['output'];
  File: Scalars['File']['output'];
  JudgeErrorOutput: JudgeErrorOutput;
  JudgeOutput: ResolversUnionTypes<ResolversParentTypes>['JudgeOutput'];
  JudgeSuccessOutput: JudgeSuccessOutput;
  Mutation: {};
  Boolean: Scalars['Boolean']['output'];
  Int: Scalars['Int']['output'];
  Problem: ProblemMapper;
  ProblemScore: ProblemScoreMapper;
  Float: Scalars['Float']['output'];
  Query: {};
  ScoreboardRow: ScoreboardRowMapper;
  Submission: SubmissionMapper;
  Subscription: {};
  Team: TeamMapper;
  User: UserMapper;
};

export type AuthDirectiveArgs = {
  role?: Maybe<UserRole>;
};

export type AuthDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = AuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ClockDirectiveArgs = { };

export type ClockDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = ClockDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ClockResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Clock'] = ResolversParentTypes['Clock']> = {
  finish?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  hold?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClockStatusResolvers = EnumResolverSignature<{ after?: any, before?: any, freeze?: any, hold?: any, running?: any }, ResolversTypes['ClockStatus']>;

export type CompetitionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Competition'] = ResolversParentTypes['Competition']> = {
  brief?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  instructions?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export interface FileScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['File'], any> {
  name: 'File';
}

export type JudgeErrorOutputResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['JudgeErrorOutput'] = ResolversParentTypes['JudgeErrorOutput']> = {
  errors?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JudgeOutputResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['JudgeOutput'] = ResolversParentTypes['JudgeOutput']> = {
  __resolveType?: TypeResolveFn<'JudgeErrorOutput' | 'JudgeSuccessOutput', ParentType, ContextType>;
};

export type JudgeSuccessOutputResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['JudgeSuccessOutput'] = ResolversParentTypes['JudgeSuccessOutput']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  adjustFinishTime?: Resolver<ResolversTypes['Clock'], ParentType, AuthenticatedContext<ContextType>, RequireFields<MutationAdjustFinishTimeArgs, 'finishTime'>>;
  adjustStartTime?: Resolver<ResolversTypes['Clock'], ParentType, AuthenticatedContext<ContextType>, RequireFields<MutationAdjustStartTimeArgs, 'startTime'>>;
  createTeam?: Resolver<ResolversTypes['Team'], ParentType, AuthenticatedContext<ContextType>, RequireFields<MutationCreateTeamArgs, 'name'>>;
  createUser?: Resolver<ResolversTypes['User'], ParentType, AuthenticatedContext<ContextType>, RequireFields<MutationCreateUserArgs, 'logn' | 'role'>>;
  deleteTeam?: Resolver<ResolversTypes['Team'], ParentType, AuthenticatedContext<ContextType>, RequireFields<MutationDeleteTeamArgs, 'id'>>;
  deleteUser?: Resolver<ResolversTypes['User'], ParentType, AuthenticatedContext<ContextType>, RequireFields<MutationDeleteUserArgs, 'id'>>;
  getAdminFuzz?: Resolver<ResolversTypes['String'], ParentType, AuthenticatedContext<ContextType>, RequireFields<MutationGetAdminFuzzArgs, 'slug' | 'teamId'>>;
  holdClock?: Resolver<ResolversTypes['Clock'], ParentType, AuthenticatedContext<ContextType>>;
  judge?: Resolver<ResolversTypes['JudgeOutput'], ParentType, AuthenticatedContext<ContextType>, RequireFields<MutationJudgeArgs, 'code' | 'output' | 'slug'>>;
  overrideJudge?: Resolver<ResolversTypes['Submission'], ParentType, AuthenticatedContext<ContextType>, RequireFields<MutationOverrideJudgeArgs, 'solved' | 'submissionId'>>;
  releaseClock?: Resolver<ResolversTypes['Clock'], ParentType, AuthenticatedContext<ContextType>, Partial<MutationReleaseClockArgs>>;
  releaseResults?: Resolver<ResolversTypes['Clock'], ParentType, AuthenticatedContext<ContextType>>;
  updateTeam?: Resolver<ResolversTypes['Team'], ParentType, AuthenticatedContext<ContextType>, RequireFields<MutationUpdateTeamArgs, 'id'>>;
  updateUser?: Resolver<ResolversTypes['User'], ParentType, AuthenticatedContext<ContextType>, RequireFields<MutationUpdateUserArgs, 'id'>>;
};

export type ProblemResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Problem'] = ResolversParentTypes['Problem']> = {
  brief?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  difficulty?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fuzz?: Resolver<Maybe<ResolversTypes['String']>, ParentType, AuthenticatedContext<ContextType>>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  instructions?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  solved?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProblemScoreResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ProblemScore'] = ResolversParentTypes['ProblemScore']> = {
  penalty?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  problem?: Resolver<ResolversTypes['Problem'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  solved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tries?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  competition?: Resolver<ResolversTypes['Competition'], ParentType, ContextType>;
  header?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  problem?: Resolver<ResolversTypes['Problem'], ParentType, ContextType, RequireFields<QueryProblemArgs, 'slug'>>;
  problems?: Resolver<Array<ResolversTypes['Problem']>, ParentType, ContextType>;
  submission?: Resolver<Maybe<ResolversTypes['Submission']>, ParentType, AuthenticatedContext<ContextType>, RequireFields<QuerySubmissionArgs, 'id'>>;
  submissions?: Resolver<Array<ResolversTypes['Submission']>, ParentType, AuthenticatedContext<ContextType>, Partial<QuerySubmissionsArgs>>;
  team?: Resolver<ResolversTypes['Team'], ParentType, AuthenticatedContext<ContextType>, RequireFields<QueryTeamArgs, 'id'>>;
  teams?: Resolver<Array<ResolversTypes['Team']>, ParentType, AuthenticatedContext<ContextType>>;
  user?: Resolver<ResolversTypes['User'], ParentType, AuthenticatedContext<ContextType>, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, AuthenticatedContext<ContextType>>;
  version?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ScoreboardRowResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ScoreboardRow'] = ResolversParentTypes['ScoreboardRow']> = {
  penalty?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  problems?: Resolver<Array<ResolversTypes['ProblemScore']>, ParentType, ContextType>;
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubmissionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Submission'] = ResolversParentTypes['Submission']> = {
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ok?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  out?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  problemSlug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, AuthenticatedContext<ContextType>>;
  teamId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  vler?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vlms?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  clock?: SubscriptionResolver<ResolversTypes['Clock'], "clock", ParentType, ContextType>;
  scoreboard?: SubscriptionResolver<Array<ResolversTypes['ScoreboardRow']>, "scoreboard", ParentType, ContextType>;
};

export type TeamResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Team'] = ResolversParentTypes['Team']> = {
  hidden?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  seed?: Resolver<ResolversTypes['String'], ParentType, AuthenticatedContext<ContextType>>;
  submissions?: Resolver<Array<ResolversTypes['Submission']>, ParentType, AuthenticatedContext<ContextType>, Partial<TeamSubmissionsArgs>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  logn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['UserRole'], ParentType, ContextType>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, AuthenticatedContext<ContextType>>;
  teamId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserRoleResolvers = EnumResolverSignature<{ admin?: any, competitor?: any }, ResolversTypes['UserRole']>;

export type Resolvers<ContextType = GraphQLContext> = {
  Clock?: ClockResolvers<ContextType>;
  ClockStatus?: ClockStatusResolvers;
  Competition?: CompetitionResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  File?: GraphQLScalarType;
  JudgeErrorOutput?: JudgeErrorOutputResolvers<ContextType>;
  JudgeOutput?: JudgeOutputResolvers<ContextType>;
  JudgeSuccessOutput?: JudgeSuccessOutputResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Problem?: ProblemResolvers<ContextType>;
  ProblemScore?: ProblemScoreResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ScoreboardRow?: ScoreboardRowResolvers<ContextType>;
  Submission?: SubmissionResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Team?: TeamResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserRole?: UserRoleResolvers;
};

export type DirectiveResolvers<ContextType = GraphQLContext> = {
  auth?: AuthDirectiveResolver<any, any, ContextType>;
  clock?: ClockDirectiveResolver<any, any, ContextType>;
};
