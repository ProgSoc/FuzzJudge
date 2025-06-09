import LinkTabs from "@/components/LinkTabs";
import { userQuery } from "@/queries/user.query";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
	component: RouteComponent,
	loader: async ({ context: { queryClient } }) => {
		const currentUser = await queryClient.ensureQueryData(userQuery.me());

		if (currentUser.data.me?.role !== "admin") {
			throw redirect({
				to: "/",
			});
		}
	},
});

function RouteComponent() {
	return (
		<>
			<LinkTabs
				tabs={[
					{
						to: "/admin",
						label: "Dashboard",
					},
					{
						to: "/admin/clock",
						label: "Clock",
					},
					{
						to: "/admin/users",
						label: "Users",
					},
				]}
			/>
			<Outlet />
		</>
	);
}
