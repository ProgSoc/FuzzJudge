import { problemQueries } from "@/queries/problems.queries";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import Markdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/problems/$problemId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { problemId } = Route.useParams();
	const { data } = useQuery(problemQueries.getProblem(problemId));
	return <Markdown>{data?.content}</Markdown>;
}
