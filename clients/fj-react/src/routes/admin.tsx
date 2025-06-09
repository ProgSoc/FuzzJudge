import LinkTabs from "@/components/LinkTabs";
import { userQueries } from "@/queries/user.query";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
	component: RouteComponent,
	beforeLoad: async ({ context: { queryClient } }) => {
		const currentUser = await queryClient.ensureQueryData(userQueries.me());

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
					{
						to: "/admin/teams",
						label: "Teams",
					},
					{
						to: "/admin/submissions",
						label: "Submissions",
					},
				]}
			/>
			<Outlet />
		</>
	);
}
