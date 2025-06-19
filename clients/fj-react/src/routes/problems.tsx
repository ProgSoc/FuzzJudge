import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/problems")({
	beforeLoad: () => ({
		getTitle: () => "Problems",
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
