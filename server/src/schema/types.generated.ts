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
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: Date | string; output: Date | string; }
};

export type Clock = {
  __typename?: 'Clock';
  finish: Scalars['DateTime']['output'];
  hold?: Maybe<Scalars['DateTime']['output']>;
  start: Scalars['DateTime']['output'];
};

export type CompetitionQuery = {
  __typename?: 'CompetitionQuery';
  brief: Scalars['String']['output'];
  instructions: Scalars['String']['output'];
  name: Scalars['String']['output'];
  submissions: Array<Submission>;
};


export type CompetitionQuerysubmissionsArgs = {
  slug: Scalars['String']['input'];
  teamId: Scalars['Int']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  testMutation?: Maybe<Scalars['String']['output']>;
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
  competition?: Maybe<CompetitionQuery>;
  header: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type ScoreboardTeam = {
  __typename?: 'ScoreboardTeam';
  name: Scalars['String']['output'];
  rank: Scalars['Int']['output'];
  score: TeamScore;
};

export type Submission = {
  __typename?: 'Submission';
  id: Scalars['Int']['output'];
  ok?: Maybe<Scalars['Boolean']['output']>;
  prob: Scalars['String']['output'];
  team: Scalars['Int']['output'];
  time: Scalars['DateTime']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  clock: Clock;
  countdown: Scalars['Int']['output'];
  scoreboard: Array<ScoreboardTeam>;
};


export type SubscriptioncountdownArgs = {
  from: Scalars['Int']['input'];
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



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Clock: ResolverTypeWrapper<Clock>;
  CompetitionQuery: ResolverTypeWrapper<CompetitionQuery>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  ProblemScore: ResolverTypeWrapper<ProblemScore>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Query: ResolverTypeWrapper<{}>;
  ScoreboardTeam: ResolverTypeWrapper<ScoreboardTeam>;
  Submission: ResolverTypeWrapper<Submission>;
  Subscription: ResolverTypeWrapper<{}>;
  TeamScore: ResolverTypeWrapper<TeamScore>;
  TeamTotal: ResolverTypeWrapper<TeamTotal>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Clock: Clock;
  CompetitionQuery: CompetitionQuery;
  String: Scalars['String']['output'];
  Int: Scalars['Int']['output'];
  DateTime: Scalars['DateTime']['output'];
  Mutation: {};
  ProblemScore: ProblemScore;
  Float: Scalars['Float']['output'];
  Boolean: Scalars['Boolean']['output'];
  Query: {};
  ScoreboardTeam: ScoreboardTeam;
  Submission: Submission;
  Subscription: {};
  TeamScore: TeamScore;
  TeamTotal: TeamTotal;
};

export type ClockResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Clock'] = ResolversParentTypes['Clock']> = {
  finish?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  hold?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CompetitionQueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CompetitionQuery'] = ResolversParentTypes['CompetitionQuery']> = {
  brief?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  instructions?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  submissions?: Resolver<Array<ResolversTypes['Submission']>, ParentType, ContextType, RequireFields<CompetitionQuerysubmissionsArgs, 'slug' | 'teamId'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  testMutation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type ProblemScoreResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ProblemScore'] = ResolversParentTypes['ProblemScore']> = {
  penalty?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  solved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tries?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  competition?: Resolver<Maybe<ResolversTypes['CompetitionQuery']>, ParentType, ContextType>;
  header?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ScoreboardTeamResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ScoreboardTeam'] = ResolversParentTypes['ScoreboardTeam']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  score?: Resolver<ResolversTypes['TeamScore'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubmissionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Submission'] = ResolversParentTypes['Submission']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ok?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  prob?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  clock?: SubscriptionResolver<ResolversTypes['Clock'], "clock", ParentType, ContextType>;
  countdown?: SubscriptionResolver<ResolversTypes['Int'], "countdown", ParentType, ContextType, RequireFields<SubscriptioncountdownArgs, 'from'>>;
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
  Clock?: ClockResolvers<ContextType>;
  CompetitionQuery?: CompetitionQueryResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  ProblemScore?: ProblemScoreResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ScoreboardTeam?: ScoreboardTeamResolvers<ContextType>;
  Submission?: SubmissionResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  TeamScore?: TeamScoreResolvers<ContextType>;
  TeamTotal?: TeamTotalResolvers<ContextType>;
};

