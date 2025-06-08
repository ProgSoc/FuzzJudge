import { Outlet, createFileRoute } from "@tanstack/react-router";

import { LinkListItemButton } from "@/components/LinkListItemButton";
import { problemQuery } from "@/queries/problem.query";
import { Avatar, ListItemAvatar } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
// import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
// import MailIcon from '@mui/icons-material/Mail';
// import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { MdMenu } from "react-icons/md";

const drawerWidth = 300;

export default function ResponsiveDrawer() {
	const problemsQuery = useQuery({
		...problemQuery.problemList(),
		select: (data) => data.data.problems,
	});

	return (
		<Box sx={{ display: "flex", flexDirection: "column" }}>
			<AppBar position="static">
				<Toolbar>
					<IconButton
						// size="large"
						// edge="start"
						color="inherit"
						aria-label="menu"
						sx={{ mr: 2 }}
					>
						<MdMenu />
					</IconButton>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						News
					</Typography>
				</Toolbar>
			</AppBar>
			<Box
				sx={{
					display: "flex",
				}}
			>
				<Box
					component="nav"
					sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
					aria-label="mailbox folders"
				>
					<List>
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
				</Box>
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
		</Box>
	);
}

export const Route = createFileRoute("/problems")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<ResponsiveDrawer />
		// <div>Hello "/problems/"!</div>
	);
}
