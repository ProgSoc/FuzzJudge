import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { GraphQLContext } from '@/context';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string | number; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: Date | string; output: Date | string; }
  File: { input: File; output: File; }
};

export type AlreadySolvedError = {
  __typename?: 'AlreadySolvedError';
  message: Scalars['String']['output'];
};

export type Clock = {
  __typename?: 'Clock';
  finish: Scalars['DateTime']['output'];
  hold?: Maybe<Scalars['DateTime']['output']>;
  start: Scalars['DateTime']['output'];
};

export type Competition = {
  __typename?: 'Competition';
  brief: Scalars['String']['output'];
  instructions: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type JudgeOutput = AlreadySolvedError | JudgeOutputSuccess | JudgingError | NotInTeamError;

export type JudgeOutputSuccess = {
  __typename?: 'JudgeOutputSuccess';
  message: Scalars['String']['output'];
};

export type JudgingError = {
  __typename?: 'JudgingError';
  errors: Array<Scalars['String']['output']>;
  message: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  adjustFinishTime: Clock;
  adjustStartTime: Clock;
  holdClock: Clock;
  judge: JudgeOutput;
  releaseClock: Clock;
};


export type MutationadjustFinishTimeArgs = {
  finishTime: Scalars['DateTime']['input'];
};


export type MutationadjustStartTimeArgs = {
  keepDuration?: InputMaybe<Scalars['Boolean']['input']>;
  startTime: Scalars['DateTime']['input'];
};


export type MutationjudgeArgs = {
  code: Scalars['File']['input'];
  output: Scalars['String']['input'];
  slug: Scalars['ID']['input'];
};


export type MutationreleaseClockArgs = {
  extendDuration?: InputMaybe<Scalars['Boolean']['input']>;
};

export type NotInTeamError = {
  __typename?: 'NotInTeamError';
  message: Scalars['String']['output'];
};

export type Problem = {
  __typename?: 'Problem';
  brief: Scalars['String']['output'];
  difficulty: Scalars['Int']['output'];
  fuzz: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  instructions: Scalars['String']['output'];
  name: Scalars['String']['output'];
  points: Scalars['Int']['output'];
  slug: Scalars['ID']['output'];
  solved: Scalars['Boolean']['output'];
};

export type ProblemScore = {
  __typename?: 'ProblemScore';
  penalty: Scalars['Float']['output'];
  points: Scalars['Int']['output'];
  solved: Scalars['Boolean']['output'];
  tries: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  competition: Competition;
  header: Scalars['String']['output'];
  problem: Problem;
  problems: Array<Problem>;
  submission?: Maybe<Submission>;
  submissions?: Maybe<Submission>;
  version: Scalars['String']['output'];
};


export type QueryproblemArgs = {
  slug: Scalars['String']['input'];
};


export type QuerysubmissionArgs = {
  id: Scalars['ID']['input'];
};

export type ScoreboardTeam = {
  __typename?: 'ScoreboardTeam';
  name: Scalars['String']['output'];
  rank: Scalars['Int']['output'];
  score: TeamScore;
};

export type Submission = {
  __typename?: 'Submission';
  code?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  ok: Scalars['Boolean']['output'];
  out?: Maybe<Scalars['String']['output']>;
  problemId: Scalars['ID']['output'];
  teamId: Scalars['ID']['output'];
  time: Scalars['DateTime']['output'];
  vler?: Maybe<Scalars['String']['output']>;
  vlms?: Maybe<Scalars['Float']['output']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  clock: Clock;
  scoreboard: Array<ScoreboardTeam>;
};

export type TeamScore = {
  __typename?: 'TeamScore';
  problems: Array<ProblemScore>;
  total: TeamTotal;
};

export type TeamTotal = {
  __typename?: 'TeamTotal';
  penalty: Scalars['Float']['output'];
  points: Scalars['Int']['output'];
};



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
  JudgeOutput: ( AlreadySolvedError & { __typename: 'AlreadySolvedError' } ) | ( JudgeOutputSuccess & { __typename: 'JudgeOutputSuccess' } ) | ( JudgingError & { __typename: 'JudgingError' } ) | ( NotInTeamError & { __typename: 'NotInTeamError' } );
};


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AlreadySolvedError: ResolverTypeWrapper<AlreadySolvedError>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Clock: ResolverTypeWrapper<Clock>;
  Competition: ResolverTypeWrapper<Competition>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  File: ResolverTypeWrapper<Scalars['File']['output']>;
  JudgeOutput: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['JudgeOutput']>;
  JudgeOutputSuccess: ResolverTypeWrapper<JudgeOutputSuccess>;
  JudgingError: ResolverTypeWrapper<JudgingError>;
  Mutation: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  NotInTeamError: ResolverTypeWrapper<NotInTeamError>;
  Problem: ResolverTypeWrapper<Problem>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  ProblemScore: ResolverTypeWrapper<ProblemScore>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Query: ResolverTypeWrapper<{}>;
  ScoreboardTeam: ResolverTypeWrapper<ScoreboardTeam>;
  Submission: ResolverTypeWrapper<Submission>;
  Subscription: ResolverTypeWrapper<{}>;
  TeamScore: ResolverTypeWrapper<TeamScore>;
  TeamTotal: ResolverTypeWrapper<TeamTotal>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AlreadySolvedError: AlreadySolvedError;
  String: Scalars['String']['output'];
  Clock: Clock;
  Competition: Competition;
  DateTime: Scalars['DateTime']['output'];
  File: Scalars['File']['output'];
  JudgeOutput: ResolversUnionTypes<ResolversParentTypes>['JudgeOutput'];
  JudgeOutputSuccess: JudgeOutputSuccess;
  JudgingError: JudgingError;
  Mutation: {};
  Boolean: Scalars['Boolean']['output'];
  ID: Scalars['ID']['output'];
  NotInTeamError: NotInTeamError;
  Problem: Problem;
  Int: Scalars['Int']['output'];
  ProblemScore: ProblemScore;
  Float: Scalars['Float']['output'];
  Query: {};
  ScoreboardTeam: ScoreboardTeam;
  Submission: Submission;
  Subscription: {};
  TeamScore: TeamScore;
  TeamTotal: TeamTotal;
};

export type AlreadySolvedErrorResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AlreadySolvedError'] = ResolversParentTypes['AlreadySolvedError']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClockResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Clock'] = ResolversParentTypes['Clock']> = {
  finish?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  hold?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

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

export type JudgeOutputResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['JudgeOutput'] = ResolversParentTypes['JudgeOutput']> = {
  __resolveType?: TypeResolveFn<'AlreadySolvedError' | 'JudgeOutputSuccess' | 'JudgingError' | 'NotInTeamError', ParentType, ContextType>;
};

export type JudgeOutputSuccessResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['JudgeOutputSuccess'] = ResolversParentTypes['JudgeOutputSuccess']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JudgingErrorResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['JudgingError'] = ResolversParentTypes['JudgingError']> = {
  errors?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  adjustFinishTime?: Resolver<ResolversTypes['Clock'], ParentType, ContextType, RequireFields<MutationadjustFinishTimeArgs, 'finishTime'>>;
  adjustStartTime?: Resolver<ResolversTypes['Clock'], ParentType, ContextType, RequireFields<MutationadjustStartTimeArgs, 'startTime'>>;
  holdClock?: Resolver<ResolversTypes['Clock'], ParentType, ContextType>;
  judge?: Resolver<ResolversTypes['JudgeOutput'], ParentType, ContextType, RequireFields<MutationjudgeArgs, 'code' | 'output' | 'slug'>>;
  releaseClock?: Resolver<ResolversTypes['Clock'], ParentType, ContextType, Partial<MutationreleaseClockArgs>>;
};

export type NotInTeamErrorResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['NotInTeamError'] = ResolversParentTypes['NotInTeamError']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProblemResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Problem'] = ResolversParentTypes['Problem']> = {
  brief?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  difficulty?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fuzz?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  instructions?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  solved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProblemScoreResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ProblemScore'] = ResolversParentTypes['ProblemScore']> = {
  penalty?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  solved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tries?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  competition?: Resolver<ResolversTypes['Competition'], ParentType, ContextType>;
  header?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  problem?: Resolver<ResolversTypes['Problem'], ParentType, ContextType, RequireFields<QueryproblemArgs, 'slug'>>;
  problems?: Resolver<Array<ResolversTypes['Problem']>, ParentType, ContextType>;
  submission?: Resolver<Maybe<ResolversTypes['Submission']>, ParentType, ContextType, RequireFields<QuerysubmissionArgs, 'id'>>;
  submissions?: Resolver<Maybe<ResolversTypes['Submission']>, ParentType, ContextType>;
  version?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ScoreboardTeamResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ScoreboardTeam'] = ResolversParentTypes['ScoreboardTeam']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  score?: Resolver<ResolversTypes['TeamScore'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubmissionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Submission'] = ResolversParentTypes['Submission']> = {
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ok?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  out?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  problemId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  vler?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vlms?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  clock?: SubscriptionResolver<ResolversTypes['Clock'], "clock", ParentType, ContextType>;
  scoreboard?: SubscriptionResolver<Array<ResolversTypes['ScoreboardTeam']>, "scoreboard", ParentType, ContextType>;
};

export type TeamScoreResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TeamScore'] = ResolversParentTypes['TeamScore']> = {
  problems?: Resolver<Array<ResolversTypes['ProblemScore']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['TeamTotal'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamTotalResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TeamTotal'] = ResolversParentTypes['TeamTotal']> = {
  penalty?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  AlreadySolvedError?: AlreadySolvedErrorResolvers<ContextType>;
  Clock?: ClockResolvers<ContextType>;
  Competition?: CompetitionResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  File?: GraphQLScalarType;
  JudgeOutput?: JudgeOutputResolvers<ContextType>;
  JudgeOutputSuccess?: JudgeOutputSuccessResolvers<ContextType>;
  JudgingError?: JudgingErrorResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NotInTeamError?: NotInTeamErrorResolvers<ContextType>;
  Problem?: ProblemResolvers<ContextType>;
  ProblemScore?: ProblemScoreResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ScoreboardTeam?: ScoreboardTeamResolvers<ContextType>;
  Submission?: SubmissionResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  TeamScore?: TeamScoreResolvers<ContextType>;
  TeamTotal?: TeamTotalResolvers<ContextType>;
};

