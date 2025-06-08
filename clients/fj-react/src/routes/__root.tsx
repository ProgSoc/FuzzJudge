import LinkBottomNavigation from "@/components/LinkBottomNavigation";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { FaHome, FaList } from "react-icons/fa";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: () => (
		<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<Outlet />
			<LinkBottomNavigation
				tabs={[
					{
						label: "Home",
						to: "/",
						icon: <FaHome />,
					},
					{
						label: "Leaderboard",
						to: "/leaderboard",
						icon: <FaList />,
					},
				]}
				style={{ marginTop: "auto" }}
			/>
			<ReactQueryDevtools buttonPosition="top-right" />
			<TanStackRouterDevtools position="bottom-right" />
		</div>
	),
});
