import { UserRole } from "@/gql";
import type { TabItem } from "@/hooks/useTabIndex";
import { userQueries } from "@/queries/user.query";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { FaHome, FaList } from "react-icons/fa";
import { MdLock, MdPeople } from "react-icons/md";
import LinkBottomNavigation from "./LinkBottomNavigation";

const baseTabs: TabItem[] = [
	{
		label: "Home",
		to: "/",
		icon: <FaHome />,
	},
	{
		label: "Problems",
		to: "/problems",
		icon: <FaList />,
	},
	{
		label: "Leaderboard",
		to: "/leaderboard",
		icon: <MdPeople />,
	},
];

const adminTabs = baseTabs.concat([
	{
		label: "Admin",
		to: "/admin/clock",
		icon: <MdLock />,
	},
]);

export default function BottomBar() {
	const currentUserRole = useQuery({
		...userQueries.me(),
		select: (data) => data.data.me?.role,
	});

	const tabs = useMemo(
		() => (currentUserRole.data !== UserRole.Admin ? baseTabs : adminTabs),
		[currentUserRole.data],
	);

	return <LinkBottomNavigation tabs={tabs} />;
}
