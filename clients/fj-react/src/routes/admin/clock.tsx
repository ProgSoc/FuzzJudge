import {
	ClockSubscriptionDocument,
	type ClockSubscriptionSubscription,
} from "@/gql";
import useSubscription from "@/hooks/useSubscription";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/clock")({
	component: RouteComponent,
});

const selectFn = (data: ClockSubscriptionSubscription) => data.clock;

function RouteComponent() {
	const clockState = useSubscription({
		query: ClockSubscriptionDocument,
		select: selectFn,
	});

	return <div>{clockState?.start.toString()}</div>;
}
