import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/problems/$slug")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/problems/$slug"!</div>;
}
