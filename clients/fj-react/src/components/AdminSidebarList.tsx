import { List, ListItemIcon, ListItemText } from "@mui/material";
import { MdInbox, MdPeople, MdPerson, MdTimer } from "react-icons/md";
import { LinkListItemButton } from "./LinkListItemButton";

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
