import { UserRole } from "@/gql";
import { useDisclosure } from "@/hooks/useDisclosure";
import { userQueries } from "@/queries/user.query";
import {
	Collapse,
	Divider,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Paper,
	Toolbar,
	Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import AdminList from "./AdminSidebarList";
import { LinkListItemButton } from "./LinkListItemButton";
import ProblemList from "./ProblemSidebarList";
import useClockCountdown, { durationToText } from "@/hooks/useClockcountdown";
import TimerIcon from "@mui/icons-material/Timer";
import InfoIcon from "@mui/icons-material/Info";
import PeopleIcon from "@mui/icons-material/People";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ListIcon from "@mui/icons-material/List";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMemo } from "react";

function ClockListItem() {
	const { duration, text } = useClockCountdown();
	const primary = useMemo(
		() =>
			text === "Ending in" || text === "Starting in"
				? durationToText(duration)
				: text,
		[duration, text],
	);

	return (
		<ListItem>
			<ListItemText
				primary={
					<Typography variant="h5" sx={{ fontWeight: "bold" }}>
						{primary}
					</Typography>
				}
			/>
		</ListItem>
	);
}

export default function DrawerContent() {
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
			<List
				sx={{
					pt: 0,
				}}
			>
				<ClockListItem />
				<Divider />
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
						<InfoIcon />
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
						<PeopleIcon />
					</ListItemIcon>
					<ListItemText primary="Leaderboard" />
				</LinkListItemButton>
				<ListItemButton {...getButtonProps()}>
					<ListItemIcon>
						<ListIcon />
					</ListItemIcon>
					<ListItemText primary="Problems" />
					{isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
				</ListItemButton>
				<Collapse in={isOpen} timeout="auto" unmountOnExit>
					<ProblemList />
				</Collapse>
				{userRoleQuery.data === UserRole.Admin ? (
					<>
						<ListItemButton {...getAdminButtonProps()}>
							<ListItemIcon>
								<PeopleIcon />
							</ListItemIcon>
							<ListItemText primary="Admin" />
							{isAdminOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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
