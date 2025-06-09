import TopBar from "@/components/TopBar";
import { Box } from "@mui/material";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import BottomBar from "../components/BottomBar";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	getTitle?: () => string;
}>()({
	head: () => ({
		meta: [
			{
				title: "FuzzJudge React Client",
			},
		],
	}),
	component: () => (
		<Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<TopBar />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					flexGrow: 1,
					overflowY: "auto",
				}}
			>
				<Outlet />
			</Box>
			<BottomBar />
			<ReactQueryDevtools buttonPosition="bottom-left" />
			<TanStackRouterDevtools position="bottom-right" />
		</Box>
	),
});
