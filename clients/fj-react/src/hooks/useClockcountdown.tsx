import {
	ClockSubscriptionDocument,
	type ClockSubscriptionSubscription,
} from "@/gql";
import useSubscription from "@/hooks/useSubscription";
import { DateTime, type Duration } from "luxon";
import { useEffect, useState } from "react";

const scalarToDateTime = (date: Date | string) =>
	typeof date === "string" ? DateTime.fromISO(date) : DateTime.fromJSDate(date);

type AlwaysState =
	| { text: "Starting in"; duration: Duration }
	| { text: "Ending in"; duration: Duration }
	| { text: "Hold"; duration: null }
	| { text: "Ended"; duration: null }
	| { text: "Loading"; duration: null };

type ReturnState = AlwaysState & {
	/** The percentage complete */
	progress: number;
};

/**
 * Basically there's a few stages of a competition, the time before it starts, whether it's on hold (date or null) and the time it ends.
 */
export default function useClockCountdown(): ReturnState {
	const [clockReturnState, setClockReturnState] = useState<ReturnState>({
		text: "Loading",
		duration: null,
		progress: 0,
	});

	const clockState = useSubscription({
		query: ClockSubscriptionDocument,
		select: (data: ClockSubscriptionSubscription) => data.clock,
	});

	useEffect(() => {
		const interval = setInterval(() => {
			if (!clockState) {
				setClockReturnState({
					text: "Loading",
					duration: null,
					progress: 0,
				});
				return;
			}
			const currentTime = DateTime.now();
			const startDateTime = scalarToDateTime(clockState.start);
			const endDateTime = scalarToDateTime(clockState.finish);
			/** The time when the competition was paused */
			const hold = clockState?.hold ? scalarToDateTime(clockState?.hold) : null;

			if (!startDateTime || !endDateTime) {
				setClockReturnState({
					text: "Loading",
					duration: null,
					progress: 0,
				});
				return;
			}

			if (hold instanceof DateTime) {
				setClockReturnState({
					text: "Hold",
					duration: null,
					progress: 0,
				});
				return;
			}

			if (currentTime < startDateTime) {
				const timeUntilStart = startDateTime.diff(currentTime, [
					"days",
					"hours",
					"minutes",
					"seconds",
				]);

				setClockReturnState({
					text: "Starting in",
					duration: timeUntilStart,
					progress: 0,
				});
				return;
			}

			if (currentTime > endDateTime) {
				setClockReturnState({
					text: "Ended",
					duration: null,
					progress: 1,
				});
				return;
			}

			const timeRemaining = endDateTime.diff(currentTime, [
				"days",
				"hours",
				"minutes",
				"seconds",
			]);

			setClockReturnState({
				text: "Ending in",
				duration: timeRemaining,
				progress:
					1 -
					timeRemaining.as("seconds") /
						endDateTime.diff(startDateTime).as("seconds"),
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [clockState]);

	return clockReturnState;
}

export const durationToText = (duration: Duration) =>
	duration.toFormat("dd:hh:mm:ss");
