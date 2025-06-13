import { useDisclosure } from "@/hooks/useDisclosure";
import useLogoutMutation from "@/hooks/useLogoutMutation";
import { userQueries } from "@/queries/user.query";
import {
	AppBar,
	IconButton,
	Menu,
	MenuItem,
	Toolbar,
	Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useRef } from "react";
import { MdPerson } from "react-icons/md";
import LoginDialog from "./LoginDialog";
import ModeSwitchButton from "./ModeSwitchButton";
import RegisterDialog from "./RegisterDialog";

export default function TopBar() {
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
				<ProfileButton />
			</Toolbar>
		</AppBar>
	);
}

function ProfileButton() {
	const menuButtonRef = useRef<HTMLButtonElement>(null);

	const meQuery = useQuery(userQueries.me());

	const {
		getDisclosureProps: getProfileMenuDisclosureProps,
		getButtonProps: getProfileMenuButtonProps,
		isOpen: isProfileMenuOpen,
		onClose: onProfileMenuClose,
	} = useDisclosure();

	const { getDisclosureProps: getLoginDisclosureProps, onOpen: onLoginOpen } =
		useDisclosure();

	const {
		getDisclosureProps: getRegisterDisclosureProps,
		onOpen: onRegisterOpen,
	} = useDisclosure();

	const logoutMutation = useLogoutMutation();

	return (
		<>
			<IconButton
				ref={menuButtonRef}
				aria-label="profile menu"
				aria-controls={isProfileMenuOpen ? "profile-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={isProfileMenuOpen ? "true" : undefined}
				color="inherit"
				{...getProfileMenuButtonProps()}
			>
				<MdPerson />
			</IconButton>
			<LoginDialog {...getLoginDisclosureProps()} />
			<RegisterDialog {...getRegisterDisclosureProps()} />
			<Menu
				{...getProfileMenuDisclosureProps()}
				id="profile-menu"
				anchorEl={menuButtonRef.current}
			>
				{meQuery.data ? (
					<MenuItem
						onClick={async () => {
							await logoutMutation.mutateAsync(undefined);
							onProfileMenuClose();
						}}
					>
						Logout
					</MenuItem>
				) : (
					<>
						<MenuItem
							onClick={() => {
								onLoginOpen();
								onProfileMenuClose();
							}}
						>
							Login
						</MenuItem>
						<MenuItem
							onClick={() => {
								onRegisterOpen();
								onProfileMenuClose();
							}}
						>
							Register
						</MenuItem>
					</>
				)}
			</Menu>
		</>
	);
}
