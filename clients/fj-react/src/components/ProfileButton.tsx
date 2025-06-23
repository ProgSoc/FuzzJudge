import { useDisclosure } from "@/hooks/useDisclosure";
import useLogoutMutation from "@/hooks/useLogoutMutation";
import { userQueries } from "@/queries/user.query";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useId, useRef } from "react";
import LoginDialog from "./LoginDialog";
import RegisterDialog from "./RegisterDialog";
import PersonIcon from "@mui/icons-material/Person";

export default function ProfileButton() {
	const menuButtonRef = useRef<HTMLButtonElement>(null);

	const meQuery = useQuery(userQueries.me());

	const {
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
	const id = useId();

	const logoutMutation = useLogoutMutation();

	return (
		<>
			<IconButton
				ref={menuButtonRef}
				aria-label="profile menu"
				aria-controls={isProfileMenuOpen ? `profile-menu-${id}` : undefined}
				aria-haspopup="true"
				aria-expanded={isProfileMenuOpen ? "true" : undefined}
				color="inherit"
				{...getProfileMenuButtonProps()}
			>
				<PersonIcon />
			</IconButton>
			<LoginDialog {...getLoginDisclosureProps()} />
			<RegisterDialog {...getRegisterDisclosureProps()} />
			<Menu
				onClose={onProfileMenuClose}
				open={isProfileMenuOpen}
				id={`profile-menu-${id}`}
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
					<div>
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
					</div>
				)}
			</Menu>
		</>
	);
}
