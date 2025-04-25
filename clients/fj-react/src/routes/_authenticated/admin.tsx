import useTabIndex, { type TabItem } from "@/hooks/useTabIndex";
import { Tabs } from "@mantine/core";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin")({
	component: RouteComponent,
});

const tabs: TabItem[] = [
	{
		to: "/admin",
		label: "Root",
	},
	{
		to: "/admin/users",
		label: "Users",
	},
];

function RouteComponent() {
	const navigate = useNavigate();
	const matchingIndex = useTabIndex({
		tabs,
		defaultIndex: 0,
	});

	return (
		<>
			<Tabs value={matchingIndex?.toString() ?? "0"}>
				<Tabs.List>
					{tabs.map((tab, index) => (
						<Tabs.Tab
							key={tab.to}
							value={index.toString()}
							onClick={() => {
								navigate(tab);
							}}
							disabled={tab.disabled}
							leftSection={tab.icon}
						>
							{tab.label}
						</Tabs.Tab>
					))}
				</Tabs.List>
			</Tabs>
			<Outlet />
		</>
	);
}
