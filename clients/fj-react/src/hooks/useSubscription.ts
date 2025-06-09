import { wsClient } from "@/gql/client";
import { useEffect, useState } from "react";

type SelectFn<TData, TQueryFnData> = (data: TData) => TQueryFnData;

export default function useSubscription<
	TQueryFnData = unknown,
	TData = TQueryFnData,
>(options: {
	query: string;
	// biome-ignore lint/suspicious/noExplicitAny: Variable type is generic
	variables?: Record<string, any>;
	select?: SelectFn<TData, TQueryFnData>;
}): TQueryFnData | null {
	const [data, setData] = useState<TQueryFnData | null>(null);

	useEffect(() => {
		const unsubscribe = wsClient.subscribe<TData>(
			{ query: options.query, variables: options.variables },
			{
				next: (response) => {
					if (!response.data) return;
					const selectedData = options.select
						? options.select(response.data)
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
	}, [options.query, options.variables, options.select]);

	return data;
}
