import { useDisclosure } from "@/hooks/useDisclosure";
import useLogoutMutation from "@/hooks/useLogoutMutation";
import { userQueries } from "@/queries/user.query";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { MdPerson } from "react-icons/md";
import LoginDialog from "./LoginDialog";
import RegisterDialog from "./RegisterDialog";

export default function ProfileButton() {
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
