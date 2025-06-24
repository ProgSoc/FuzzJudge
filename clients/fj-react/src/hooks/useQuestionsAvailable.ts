import { UserRole, type ClockSubscriptionSubscription } from "@/gql";
import { clockQueries } from "@/queries/clock.query";
import { userQueries } from "@/queries/user.query";
import { useQuery } from "@tanstack/react-query";
import { DateTime, type Duration } from "luxon";
import { useEffect, useState } from "react";

const scalarToDateTime = (date: Date | string) =>
	typeof date === "string" ? DateTime.fromISO(date) : DateTime.fromJSDate(date);

type ReturnState = boolean;

/**
 * Basically there's a few stages of a competition, the time before it starts, whether it's on hold (date or null) and the time it ends.
 */
export default function useQuestionsAvailable(): ReturnState {
	const [clockReturnState, setClockReturnState] = useState<ReturnState>(false);

	const clockState = useQuery({
		...clockQueries.clockSubscription(),
		select: (data) => data.clock,
	});

	const roleQuery = useQuery({
		...userQueries.me(),
		select: (data) => data.data.me?.role,
	});

	useEffect(() => {
		const interval = setInterval(() => {
			const clock = clockState.data;
			const role = roleQuery.data;
			const isAvailable = isQuestionsAvailable(clock, role);
			setClockReturnState(isAvailable);
		}, 1000);
		return () => clearInterval(interval);
	}, [clockState, roleQuery.data]);
	return clockReturnState;
}

export function isQuestionsAvailable(
	clock?: ClockSubscriptionSubscription["clock"],
	role?: UserRole,
) {
	if (role === UserRole.Admin) {
		return true;
	}

	if (!clock) {
		return false;
	}

	const currentTime = DateTime.now();
	const startDateTime = scalarToDateTime(clock.start);
	const endDateTime = scalarToDateTime(clock.finish);
	/** The time when the competition was paused */
	const hold = clock?.hold ? scalarToDateTime(clock?.hold) : null;

	// if between start and end time, and not on hold
	return currentTime >= startDateTime && currentTime <= endDateTime && !hold;
}

export const durationToText = (duration: Duration) =>
	duration.toFormat("dd:hh:mm:ss");
