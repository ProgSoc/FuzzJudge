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

import type { CompetitionClockMessage } from "server/clock";
import { onDestroy } from "svelte";
import { type Writable, writable } from "svelte/store";

export const selectedQuestion: Writable<string> = writable("");

export interface QuestionMeta {
	slug: string;
	num: number;
	name: string;
	icon: string;
	instructions: string;
	solved: boolean;
	points: number;
	difficulty: number;
	brief: string;
}

export const questionOrder = (a: QuestionMeta, b: QuestionMeta): number => {
	if (a.difficulty !== b.difficulty) {
		return a.difficulty - b.difficulty;
	}
	if (a.points !== b.points) {
		return a.points - b.points;
	}

	if (a.slug === b.slug) throw "Duplicate question.";

	for (let i = 0; i < a.slug.length; i++) {
		if (a.slug.charCodeAt(i) !== b.slug.charCodeAt(i)) {
			return a.slug.charCodeAt(i) - b.slug.charCodeAt(i);
		}
	}

	return 1;
};

export const difficultyName = (d: number) => {
	switch (d) {
		case 0:
			return "Tutorial";
		case 1:
			return "Easy";
		case 2:
			return "Medium";
		case 3:
			return "Hard";
	}
	return "Unknown";
};

export const truncateUsername = (username: string) => {
	const MAX_LENGTH = 14;
	return username.length > MAX_LENGTH
		? `${username.slice(0, MAX_LENGTH)}…`
		: username;
};

export interface ScoreboardUser {
	name: string;
	points: number;
	solved: string[];
}

/** @deprecated */
export const parseScoreboard = (data: string): ScoreboardUser[] => {
	const lines = data.split("\n");
	const users: ScoreboardUser[] = [];

	for (let i = 1; i < lines.length; i++) {
		const cells = lines[i].split(",").map((x) => x.trim());

		if (cells.length < 2) continue;

		const [name, points, ...solved] = cells;
		users.push({ name, points: Number.parseInt(points), solved });
	}

	return users;
};

export type CompTimes = CompetitionClockMessage;

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

function phaseEndTime(times: CompTimes, phase: CompState): Date {
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

export function getCurrentTimeStateData(times: CompTimes) {
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

	const questionsVisiblePhases = [
		CompState.LIVE_FROZEN,
		CompState.LIVE_UNFROZEN_NO_FREEZE,
		CompState.LIVE_UNFROZEN,
	];
	const questionsVisible = questionsVisiblePhases.includes(phase);

	return {
		times,
		phase,
		nextPhase,
		secondsUntilNextPhase,
		nextPhaseStart,

		questionsVisible,

		secondsUntilScoreboardFreeze,
		secondsUntilCompetitionEnd,
		secondsUntilCompetitionStart,
		scoreboardFreezeTimeSeconds,
	};
}

export type TimeStateData = ReturnType<typeof getCurrentTimeStateData>;

export function unreachable(x: never): never {
	throw new Error(`Unreachable code reached: ${x}`);
}

export function runRepeatedly(callback: () => void) {
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

export function exists<T>(val: T | null | undefined): val is T {
	return val !== null && val !== undefined;
}

/**
 * Creates a WebSocket URL from a given path.
 * @param path The path to the WebSocket server
 * @returns The WebSocket URL
 */
export function createWsUrl(path: string) {
	const proto = window.location.protocol === "https:" ? "wss" : "ws";
	const port = window.location.port ? `:${window.location.port}` : "";
	const url = `${proto}://${window.location.host}${port}${path}`;
	return url;
}
