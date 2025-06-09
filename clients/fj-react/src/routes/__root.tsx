import LinkBottomNavigation from "@/components/LinkBottomNavigation";
import ModeSwitchButton from "@/components/ModeSwitchButton";
import TopBar from "@/components/TopBar";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	Outlet,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { FaHome, FaList } from "react-icons/fa";
import { MdPeople } from "react-icons/md";
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
