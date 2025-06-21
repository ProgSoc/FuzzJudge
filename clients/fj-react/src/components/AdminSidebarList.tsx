import { List, ListItemIcon, ListItemText } from "@mui/material";
import { LinkListItemButton } from "./LinkListItemButton";
import TimerIcon from "@mui/icons-material/Timer";
import IconPerson from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import InboxIcon from "@mui/icons-material/Inbox";

export default function AdminList() {
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
					<TimerIcon />
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
					<IconPerson />
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
					<PeopleIcon />
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
					<InboxIcon />
				</ListItemIcon>
				<ListItemText primary="Submissions" />
			</LinkListItemButton>
		</List>
	);
}
