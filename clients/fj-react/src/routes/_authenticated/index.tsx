import { competitionQueries } from "@/queries/competition.queries";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import Markdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data } = useQuery(competitionQueries.getCompetitionDetails);

	return <Markdown>{data?.content}</Markdown>;
}
