import LinkBottomNavigation from "@/components/LinkBottomNavigation";
import ModeSwitchButton from "@/components/ModeSwitchButton";
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

function TopBar() {
	const matches = useRouterState({ select: (s) => s.matches });

	const title = matches
		.map((match) => match.context.getTitle?.())
		.filter((match) => match !== undefined)
		.at(-1);

	return (
		<AppBar position="static">
			<Toolbar>
				<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					{title || "FuzzJudge"}
				</Typography>
				<ModeSwitchButton />
			</Toolbar>
		</AppBar>
	);
}

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
			<LinkBottomNavigation
				tabs={[
					{
						label: "Home",
						to: "/",
						icon: <FaHome />,
					},
					{
						label: "Problems",
						to: "/problems",
						icon: <FaList />,
					},
					{
						label: "Leaderboard",
						to: "/leaderboard",
						icon: <MdPeople />,
					},
				]}
			/>
			<ReactQueryDevtools buttonPosition="bottom-left" />
			<TanStackRouterDevtools position="bottom-right" />
		</Box>
	),
});
