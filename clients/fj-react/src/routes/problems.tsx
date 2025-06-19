import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/problems")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
