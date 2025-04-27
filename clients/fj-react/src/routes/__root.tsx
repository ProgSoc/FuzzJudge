import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Notifications } from "@mantine/notifications";
import type { QueryClient } from "@tanstack/react-query";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: () => (
		<>
			<Outlet />
			<TanStackRouterDevtools />
			<ReactQueryDevtools />
			<Notifications position="top-right" />
		</>
	),
});
