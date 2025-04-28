import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/scoreboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_authenticated/scoreboard"!</div>;
}
