import {
	ClockSubscriptionDocument,
	type ClockSubscriptionSubscription,
} from "@/gql";
import useSubscription from "@/hooks/useSubscription";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/clock")({
	component: RouteComponent,
});

function RouteComponent() {
	const clockState = useSubscription({
		query: ClockSubscriptionDocument,
		select: (data: ClockSubscriptionSubscription) => data.clock,
	});

	return <div>{clockState?.start.toString()}</div>;
}
