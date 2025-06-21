import {
	ClockSubscriptionDocument,
	UserRole,
	type ClockSubscriptionSubscription,
} from "@/gql";
import useSubscription from "@/hooks/useSubscription";
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

	const clockState = useSubscription({
		query: ClockSubscriptionDocument,
		select: (data: ClockSubscriptionSubscription) => data.clock,
	});

	const roleQuery = useQuery({
		...userQueries.me(),
		select: (data) => data.data.me?.role,
	});

	useEffect(() => {
		const interval = setInterval(() => {
			if (roleQuery.data === UserRole.Admin) {
				setClockReturnState(true);
				return;
			}

			if (!clockState) {
				setClockReturnState(false);
				return;
			}
			const currentTime = DateTime.now();
			const startDateTime = scalarToDateTime(clockState.start);
			const endDateTime = scalarToDateTime(clockState.finish);
			/** The time when the competition was paused */
			const hold = clockState?.hold ? scalarToDateTime(clockState?.hold) : null;

			// if between start and end time, and not on hold
			if (currentTime >= startDateTime && currentTime <= endDateTime && !hold) {
				setClockReturnState(true);
			} else {
				setClockReturnState(false);
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [clockState, roleQuery.data]);
	return clockReturnState;
}

export const durationToText = (duration: Duration) =>
	duration.toFormat("dd:hh:mm:ss");
