import { LinkListItemButton } from "@/components/LinkListItemButton";
import ModeSwitchButton from "@/components/ModeSwitchButton";
import ProfileButton from "@/components/ProfileButton";
import { UserRole } from "@/gql";
import { useDisclosure } from "@/hooks/useDisclosure";
import { problemQuery } from "@/queries/problem.query";
import { userQueries } from "@/queries/user.query";
import { Box, Collapse } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { type QueryClient, useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	HeadContent,
	Outlet,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import { FaInfoCircle } from "react-icons/fa";
import {
	MdExpandLess,
	MdExpandMore,
	MdInbox,
	MdList,
	MdMenu,
	MdPeople,
	MdPerson,
	MdTimer,
} from "react-icons/md";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	getTitle?: () => string;
}>()({
	head: ({ matches }) => {
		const title = matches
			.map((match) => match.context.getTitle?.())
			.filter((match) => match !== undefined)
			.at(-1);

		return {
			meta: [
				{
					title: `${title} | FuzzJudge`,
				},
			],
		};
	},
	component: ResponsiveDrawer,
});

const drawerWidth = 240;

function ProblemList() {
	const problemsQuery = useQuery(problemQuery.problemList());

	return (
		<List component="div" disablePadding>
			{problemsQuery.data?.map((problem) => (
				<LinkListItemButton
					key={problem.slug}
					to={"/problems/$slug"}
					params={{ slug: problem.slug }}
					activeProps={{
						selected: true,
					}}
					sx={{ pl: 4 }}
				>
					<ListItemText
						primary={problem.name}
						secondary={`${problem.icon} Points: ${problem.points}`}
					/>
				</LinkListItemButton>
			))}
		</List>
	);
}

function AdminList() {
	// Contains clock, users, teams, submissions
	return (
		<List component="div" disablePadding>
			<LinkListItemButton
				to="/admin/clock"
				activeOptions={{
					exact: true,
				}}
				activeProps={{
					selected: true,
				}}
				sx={{ pl: 4 }}
			>
				<ListItemIcon>
					<MdTimer />
				</ListItemIcon>
				<ListItemText primary="Clock" />
			</LinkListItemButton>
			<LinkListItemButton
				to="/admin/users"
				activeOptions={{
					exact: true,
				}}
				activeProps={{
					selected: true,
				}}
				sx={{ pl: 4 }}
			>
				<ListItemIcon>
					<MdPerson />
				</ListItemIcon>
				<ListItemText primary="Users" />
			</LinkListItemButton>
			<LinkListItemButton
				to="/admin/teams"
				activeOptions={{
					exact: true,
				}}
				activeProps={{
					selected: true,
				}}
				sx={{ pl: 4 }}
			>
				<ListItemIcon>
					<MdPeople />
				</ListItemIcon>
				<ListItemText primary="Teams" />
			</LinkListItemButton>
			<LinkListItemButton
				to="/admin/submissions"
				activeOptions={{
					exact: true,
				}}
				activeProps={{
					selected: true,
				}}
				sx={{ pl: 4 }}
			>
				<ListItemIcon>
					<MdInbox />
				</ListItemIcon>
				<ListItemText primary="Submissions" />
			</LinkListItemButton>
		</List>
	);
}

function DrawerContent() {
	const userRoleQuery = useQuery({
		...userQueries.me(),
		select: (data) => data.data.me?.role,
	});

	const { getButtonProps, isOpen } = useDisclosure({
		localStorageKey: "problems-open",
	});

	const { getButtonProps: getAdminButtonProps, isOpen: isAdminOpen } =
		useDisclosure({
			localStorageKey: "admin-open",
		});

	return (
		<div>
			<Toolbar />
			<Divider />
			<List>
				<LinkListItemButton
					to={"/"}
					activeOptions={{
						exact: true,
					}}
					activeProps={{
						selected: true,
					}}
				>
					<ListItemIcon>
						<FaInfoCircle />
					</ListItemIcon>
					<ListItemText primary="Home" />
				</LinkListItemButton>
				<LinkListItemButton
					to="/leaderboard"
					activeOptions={{
						exact: true,
					}}
					activeProps={{
						selected: true,
					}}
				>
					<ListItemIcon>
						<MdPeople />
					</ListItemIcon>
					<ListItemText primary="Leaderboard" />
				</LinkListItemButton>
				<ListItemButton {...getButtonProps()}>
					<ListItemIcon>
						<MdList />
					</ListItemIcon>
					<ListItemText primary="Problems" />
					{isOpen ? <MdExpandLess /> : <MdExpandMore />}
				</ListItemButton>
				<Collapse in={isOpen} timeout="auto" unmountOnExit>
					<ProblemList />
				</Collapse>
				{userRoleQuery.data === UserRole.Admin ? (
					<>
						<ListItemButton {...getAdminButtonProps()}>
							<ListItemIcon>
								<MdPeople />
							</ListItemIcon>
							<ListItemText primary="Admin" />
							{isAdminOpen ? <MdExpandLess /> : <MdExpandMore />}
						</ListItemButton>
						<Collapse in={isAdminOpen} timeout="auto" unmountOnExit>
							<AdminList />
						</Collapse>
					</>
				) : null}
			</List>
		</div>
	);
}

export default function ResponsiveDrawer() {
	const [mobileOpen, setMobileOpen] = React.useState(false);
	const [isClosing, setIsClosing] = React.useState(false);

	const handleDrawerClose = () => {
		setIsClosing(true);
		setMobileOpen(false);
	};

	const handleDrawerTransitionEnd = () => {
		setIsClosing(false);
	};

	const handleDrawerToggle = () => {
		if (!isClosing) {
			setMobileOpen(!mobileOpen);
		}
	};

	const matches = useRouterState({ select: (s) => s.matches });

	const title = matches
		.map((match) => match.context.getTitle?.())
		.filter((match) => match !== undefined)
		.at(-1);

	return (
		<Box sx={{ display: "flex" }}>
			<HeadContent />
			<AppBar
				position="fixed"
				sx={{
					width: { sm: `calc(100% - ${drawerWidth}px)` },
					ml: { sm: `${drawerWidth}px` },
				}}
			>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						edge="start"
						onClick={handleDrawerToggle}
						sx={{ mr: 2, display: { sm: "none" } }}
					>
						<MdMenu />
					</IconButton>
					<Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
						{title || "FuzzJudge"}
					</Typography>
					<ModeSwitchButton />
					<ProfileButton />
				</Toolbar>
			</AppBar>
			<Box
				component="nav"
				sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
				aria-label="mailbox folders"
			>
				{/* The implementation can be swapped with js to avoid SEO duplication of links. */}
				<Drawer
					variant="temporary"
					open={mobileOpen}
					onTransitionEnd={handleDrawerTransitionEnd}
					onClose={handleDrawerClose}
					sx={{
						display: { xs: "block", sm: "none" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
						},
					}}
					slotProps={{
						root: {
							keepMounted: true, // Better open performance on mobile.
						},
					}}
				>
					<DrawerContent />
				</Drawer>
				<Drawer
					variant="permanent"
					sx={{
						display: { xs: "none", sm: "block" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
						},
					}}
					open
				>
					<DrawerContent />
				</Drawer>
			</Box>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					width: { sm: `calc(100% - ${drawerWidth}px)` },
				}}
			>
				<Toolbar />
				<Outlet />
			</Box>
			<ReactQueryDevtools buttonPosition="bottom-left" />
			<TanStackRouterDevtools position="bottom-right" />
		</Box>
	);
}
