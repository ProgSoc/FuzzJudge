import { wsClient } from "@/gql/client";
import { useEffect, useState } from "react";

type SelectFn<TData, TQueryFnData> = (data: TData) => TQueryFnData;

type UseSubscriptionOptions<TQueryFnData, TData> = {
	query: string;
	// biome-ignore lint/suspicious/noExplicitAny: Variable type is generic
	variables?: Record<string, any>;
	select?: SelectFn<TData, TQueryFnData>;
};

export default function useSubscription<
	TQueryFnData = unknown,
	TData = TQueryFnData,
>(options: UseSubscriptionOptions<TQueryFnData, TData>): TQueryFnData | null {
	const { query, variables = {}, select } = options;

	const [data, setData] = useState<TQueryFnData | null>(null);

	useEffect(() => {
		const unsubscribe = wsClient.subscribe<TData>(
			{ query, variables },
			{
				next: (response) => {
					if (!response.data) return;
					const selectedData = select
						? select(response.data)
						: (response.data as TQueryFnData);
					setData(selectedData);
				},
				complete: () => {
					console.log("Subscription completed");
				},
				error: (error) => {
					console.error("Error in subscription:", error);
				},
			},
		);
		return () => {
			unsubscribe();
		};
	}, [query, variables, select]);

	return data;
}
