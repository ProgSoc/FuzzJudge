/*
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { onDestroy } from "svelte";
import { unreachable } from "./utils";

import type { ClockSubscriptionSubscription } from "./gql";
import { showNotification } from "./notifications";

export type CompTimes = ClockSubscriptionSubscription["clock"];

const timesToDate = (times: ClockSubscriptionSubscription["clock"]) => ({
	start: times.start instanceof Date ? times.start : new Date(times.start),
	hold:
		times.hold instanceof Date
			? times.hold
			: typeof times.hold === "string"
				? new Date(times.hold)
				: times.hold,
	finish: times.finish instanceof Date ? times.finish : new Date(times.finish),
});

export enum CompState {
	BEFORE = 0,
	LIVE_UNFROZEN_NO_FREEZE = 1, // If freezing isn't enabled
	LIVE_UNFROZEN = 2,
	LIVE_FROZEN = 3,
	FINISHED = 4,
}

function currentCompState(times: CompTimes, now: Date) {
	if (now < times.start) {
		return CompState.BEFORE;
	}
	if (times.hold && now < times.hold) {
		return CompState.LIVE_UNFROZEN;
	}
	if (times.hold && now < times.finish) {
		return CompState.LIVE_FROZEN;
	}
	if (now < times.finish) {
		return CompState.LIVE_UNFROZEN_NO_FREEZE;
	}
	return CompState.FINISHED;
}

function nextPhaseFromPhase(times: CompTimes, phase: CompState): CompState {
	switch (phase) {
		case CompState.BEFORE:
			if (times.hold) {
				return CompState.LIVE_FROZEN;
			}
			return CompState.LIVE_UNFROZEN_NO_FREEZE;
		case CompState.LIVE_UNFROZEN_NO_FREEZE:
			return CompState.FINISHED;
		case CompState.LIVE_UNFROZEN:
			return CompState.LIVE_FROZEN;
		case CompState.LIVE_FROZEN:
			return CompState.FINISHED;
		case CompState.FINISHED:
			return CompState.FINISHED;
		default:
			unreachable(phase);
	}
}

function phaseEndTime(rawTimes: CompTimes, phase: CompState): Date {
	const times = timesToDate(rawTimes);
	switch (phase) {
		case CompState.BEFORE:
			return times.start;
		case CompState.LIVE_UNFROZEN_NO_FREEZE:
			return times.finish;
		case CompState.LIVE_UNFROZEN:
			return times.hold ?? times.finish;
		case CompState.LIVE_FROZEN:
			return times.finish;
		case CompState.FINISHED:
			return times.finish;
		default:
			unreachable(phase);
	}
}

export function getCurrentTimeStateData(rawTimes: CompTimes) {
	const times = timesToDate(rawTimes);
	function msToS(ms: number) {
		return Math.floor(Math.max(0, ms) / 1000);
	}

	const now = new Date(Date.now());
	const phase = currentCompState(times, now);
	const nextPhase = nextPhaseFromPhase(times, phase);
	const nextPhaseStart = phaseEndTime(times, nextPhase);
	const secondsUntilNextPhase = msToS(nextPhaseStart.getTime() - now.getTime());

	const secondsUntilScoreboardFreeze =
		times.hold && msToS(times.hold.getTime() - now.getTime());
	const secondsUntilCompetitionEnd = msToS(
		times.finish.getTime() - now.getTime(),
	);
	const secondsUntilCompetitionStart = msToS(
		times.start.getTime() - now.getTime(),
	);
	const scoreboardFreezeTimeSeconds =
		times.hold &&
		msToS(
			times.finish.getTime() - Math.max(times.hold.getTime(), now.getTime()),
		);

	const problemsVisiblePhases = [
		CompState.LIVE_FROZEN,
		CompState.LIVE_UNFROZEN_NO_FREEZE,
		CompState.LIVE_UNFROZEN,
	];
	const problemsVisible = problemsVisiblePhases.includes(phase);

	return {
		times,
		phase,
		nextPhase,
		secondsUntilNextPhase,
		nextPhaseStart,

		problemsVisible,

		secondsUntilScoreboardFreeze,
		secondsUntilCompetitionEnd,
		secondsUntilCompetitionStart,
		scoreboardFreezeTimeSeconds,
	};
}

export type TimeStateData = ReturnType<typeof getCurrentTimeStateData>;

export function clockTick(callback: () => void) {
	let animFrameRef: number;
	function update() {
		animFrameRef = requestAnimationFrame(update);
		callback();
	}

	update();

	onDestroy(() => {
		cancelAnimationFrame(animFrameRef);
	});
}

export function secondsToString(seconds: number) {
	// Get hours, minutes, and seconds
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secondsLeft = seconds % 60;

	function pad(n: number) {
		return n < 10 ? `0${n}` : n;
	}

	if (hours > 0) {
		return `${hours}:${pad(minutes)}:${pad(secondsLeft)}`;
	}
	return `${minutes}:${pad(secondsLeft)}`;
}

export function secondsToBinary(seconds: number) {
	const binary = seconds.toString(2).padStart(8, "0");
	return binary;
}

export function dateToTimeString(date: Date) {
	// Convert to 12 hour time hh:mm a

	let hours = date.getHours();
	const minutes = date.getMinutes();
	const ampm = hours >= 12 ? "PM" : "AM";

	hours = hours % 12;
	hours = hours ? hours : 12;

	return `${hours}:${minutes} ${ampm}`;
}

export function handleNotifications(clockState: TimeStateData) {
	if (clockState.nextPhase === CompState.FINISHED) {
		if (clockState.secondsUntilCompetitionEnd === 20 * 60) {
			showNotification("Competition ends in 20 minutes");
		}

		if (clockState.secondsUntilCompetitionEnd === 5 * 60) {
			showNotification("Competition ends in 5 minutes");
		}

		if (clockState.secondsUntilCompetitionEnd === 60) {
			showNotification("Competition ends in 60 seconds");
		}
	}

	if (
		clockState.nextPhase === CompState.LIVE_UNFROZEN ||
		clockState.nextPhase === CompState.LIVE_UNFROZEN_NO_FREEZE ||
		clockState.nextPhase === CompState.LIVE_FROZEN
	) {
		if (clockState.secondsUntilCompetitionStart === 20 * 60) {
			showNotification("Competition begins in 20 minutes");
		}

		if (clockState.secondsUntilCompetitionStart === 5 * 60) {
			showNotification("Competition begins in 5 minutes");
		}

		if (clockState.secondsUntilCompetitionStart === 60) {
			showNotification("Competition begins in 60 seconds");
		}
	}
}
