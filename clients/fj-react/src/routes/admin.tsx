import { userQueries } from "@/queries/user.query";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
	beforeLoad: async ({ context: { queryClient } }) => {
		const currentUser = await queryClient.ensureQueryData(userQueries.me());

		if (currentUser.data.me?.role !== "admin") {
			throw redirect({
				to: "/",
			});
		}

		return {
			getTitle: () => "Admin",
		};
	},
});
