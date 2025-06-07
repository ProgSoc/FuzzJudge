import type {
	QueryFunction,
	QueryFunctionContext,
	QueryKey,
} from "@tanstack/react-query";
import type { FormattedExecutionResult } from "graphql-ws";

export function streamedQuery<
	TQueryFnData = unknown,
	TQueryKey extends QueryKey = QueryKey,
>({
	queryFn,
}: {
	queryFn: (
		context: QueryFunctionContext<TQueryKey>,
	) =>
		| AsyncIterableIterator<FormattedExecutionResult<TQueryFnData, unknown>>
		| Promise<
				AsyncIterableIterator<FormattedExecutionResult<TQueryFnData, unknown>>
		  >;
}): QueryFunction<TQueryFnData | undefined, TQueryKey> {
	return async (context) => {
		const query = context.client
			.getQueryCache()
			.find({ queryKey: context.queryKey, exact: true });
		const isRefetch = !!query && query.state.data !== undefined;

		if (isRefetch) {
			query.setState({
				status: "pending",
				data: undefined,
				error: null,
				fetchStatus: "fetching",
			});
		}

		let result: TQueryFnData | undefined = undefined;
		const stream = await queryFn(context);

		for await (const chunk of stream) {
			if (context.signal.aborted) {
				break;
			}

			if (chunk.errors) {
				throw new Error(
					`GraphQL errors: ${chunk.errors.map((e) => e.message).join(", ")}`,
				);
			}

			if (chunk.data === undefined || chunk.data === null) {
				continue; // skip empty chunks
			}
			context.client.setQueryData<TQueryFnData>(context.queryKey, chunk.data);

			result = chunk.data;
		}

		// finalize result: replace-refetching needs to write to the cache
		if (isRefetch && !context.signal.aborted) {
			context.client.setQueryData<TQueryFnData>(context.queryKey, result);
		}

		return context.client.getQueryData(context.queryKey);
	};
}
