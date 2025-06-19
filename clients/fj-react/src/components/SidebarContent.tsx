import { UserRole } from "@/gql";
import { useDisclosure } from "@/hooks/useDisclosure";
import { userQueries } from "@/queries/user.query";
import {
	Collapse,
	Divider,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Toolbar,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { FaInfoCircle } from "react-icons/fa";
import { MdExpandLess, MdExpandMore, MdList, MdPeople } from "react-icons/md";
import AdminList from "./AdminSidebarList";
import { LinkListItemButton } from "./LinkListItemButton";
import ProblemList from "./ProblemSidebarList";

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
