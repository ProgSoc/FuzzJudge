import type { QueryFunction, QueryKey } from "@tanstack/react-query";
import type { Client, SubscribePayload } from "graphql-ws";

export function updatingQuery<
	TQueryFnData = unknown,
	Extensions = unknown,
	TQueryKey extends QueryKey = QueryKey,
>({
	payload,
	client,
}: {
	payload: SubscribePayload;
	client: Client;
}): QueryFunction<TQueryFnData, TQueryKey> {
	return async (context) => {
		console.log("Starting WebSocket subscription", context.queryKey);

		await new Promise<void>((resolve, reject) => {
			const unsubscribe = client.subscribe<TQueryFnData, Extensions>(payload, {
				complete: () => {
					resolve();
				},
				error: reject,
				next: (data) => {
					if (!data.data) return;
					context.client.setQueryData<TQueryFnData>(
						context.queryKey,
						data.data,
					);
				},
			});

			context.signal.addEventListener("abort", () => {
				unsubscribe();
				console.log("Subscription ended", context.queryKey);
				resolve();
			});
		});

		return context.client.getQueryData<TQueryFnData>(
			context.queryKey,
		) as TQueryFnData;
	};
}
