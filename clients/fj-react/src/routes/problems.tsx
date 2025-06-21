import useQuestionsAvailable from "@/hooks/useQuestionsAvailable";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/problems")({
	beforeLoad: () => ({
		getTitle: () => "Problems",
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const questionsAvailable = useQuestionsAvailable();

	if (!questionsAvailable) {
		return (
			<div>
				<h1>Problems are not available at the moment.</h1>
				<p>Please check back later.</p>
			</div>
		);
	}

	return <Outlet />;
}
