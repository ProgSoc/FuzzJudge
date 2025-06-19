import { Outlet, createFileRoute } from "@tanstack/react-router";

import { LinkListItemButton } from "@/components/LinkListItemButton";
import { problemQuery } from "@/queries/problem.query";
import { Avatar, Divider, ListItemAvatar, Paper } from "@mui/material";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import { useQuery } from "@tanstack/react-query";
import { MdMenu } from "react-icons/md";

const drawerWidth = 300;

export default function ResponsiveDrawer() {
	const problemsQuery = useQuery({
		...problemQuery.problemList(),
		select: (data) => data.data.problems,
	});

	return (
		<Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
			<Paper
				square
				component="nav"
				sx={{
					width: { sm: drawerWidth },
					flexShrink: { sm: 0 },
					height: "100%",
				}}
				aria-label="mailbox folders"
			>
				<List sx={{ width: "100%", height: "100%", overflowY: "auto" }}>
					<LinkListItemButton
						to={"/problems"}
						activeOptions={{
							exact: true,
						}}
						activeProps={{
							selected: true,
						}}
					>
						<ListItemAvatar>
							<Avatar>
								<MdMenu />
							</Avatar>
						</ListItemAvatar>
						<ListItemText primary="Problems" />
					</LinkListItemButton>
					<Divider />
					{problemsQuery.data?.map((problem) => (
						<LinkListItemButton
							key={problem.slug}
							to={"/problems/$slug"}
							params={{ slug: problem.slug }}
							activeProps={{
								selected: true,
							}}
						>
							<ListItemAvatar>
								<Avatar>{problem.icon}</Avatar>
							</ListItemAvatar>
							<ListItemText
								primary={problem.name}
								secondary={`Points: ${problem.points}`}
							/>
						</LinkListItemButton>
					))}
				</List>
			</Paper>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					width: { sm: `calc(100% - ${drawerWidth}px)` },
				}}
			>
				<Outlet />
			</Box>
		</Box>
	);
}

export const Route = createFileRoute("/problems")({
	beforeLoad: () => ({
		getTitle: () => "Problems",
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<ResponsiveDrawer />
		// <div>Hello "/problems/"!</div>
	);
}
