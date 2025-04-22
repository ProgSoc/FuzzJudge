/*
 * FuzzJudge - Randomised input judging server, designed for ProgComp.
 * Copyright (C) 2024 UTS Programmers' Society (ProgSoc)
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { ee } from "./ee.ts";
import { getOrSetDefaultMeta, setMeta } from "./services/meta.service.ts";

export type ClockState = "live" | "hold" | "stop";

export type CompetitionClockMessage = {
	start: Date;
	finish: Date;
	hold: Date | null;
};

export async function createClock(plannedStart: Date, plannedFinish: Date) {
	const state: ClockState = "hold";
	let start: Date;
	let finish: Date;
	let holdDate: Date | null;
	start = new Date(
		await getOrSetDefaultMeta("/comp/clock/start", plannedStart.toJSON()),
	);
	// if (plannedFinish < plannedStart) plannedFinish = plannedStart;
	const newFinish = plannedFinish < plannedStart ? plannedStart : plannedFinish;

	finish = new Date(
		await getOrSetDefaultMeta("/comp/clock/finish", newFinish.toJSON()),
	);
	holdDate = null;

	function protect(allowWhen: Iterable<ClockState>): undefined | never {
		const allowedStates = new Set(allowWhen);
		if (!allowedStates.has(state)) {
			let message = "";
			switch (state) {
				case "hold":
					message = "Clock on hold.\n";
					break;
				case "live":
					message = "Clock is live.\n";
					break;
				case "stop":
					message = "Clock is stopped.\n";
					break;
			}
			throw new Response(`503 Unavailable\n\n${message}`, { status: 503 });
		}
	}

	function now() {
		return {
			start: start,
			finish: finish,
			hold: holdDate,
		};
	}

	async function adjustStart(time: Date, { keepDuration = false }) {
		const delta = start.getTime() - time.getTime();
		start = new Date(await setMeta("/comp/clock/start", time.toJSON()));
		if (keepDuration)
			finish = new Date(
				await setMeta(
					"/comp/clock/finish",
					new Date(finish.getTime() - delta).toJSON(),
				),
			);
		ee.emit("clock", now());
	}

	async function adjustFinish(timeOrMinutesDuration: Date | number) {
		let newFinish: Date;
		if (typeof timeOrMinutesDuration === "number") {
			const duration = timeOrMinutesDuration;
			newFinish = new Date(start.getTime() + duration * 60_000);
		} else {
			newFinish = timeOrMinutesDuration;
		}
		if (newFinish < start)
			throw new RangeError("Finish time must be after start.");
		finish = new Date(await setMeta("/comp/clock/finish", newFinish.toJSON()));
		ee.emit("clock", now());
	}

	function hold() {
		holdDate = new Date();
		ee.emit("clock", now());
	}

	function release({ extendDuration = false }) {
		if (holdDate === null) return;
		const delta = holdDate.getTime() - Date.now();
		if (extendDuration) finish = new Date(finish.getTime() - delta);
		holdDate = null;
		ee.emit("clock", now());
	}

	return {
		now,
		adjustStart,
		adjustFinish,
		hold,
		release,
		protect,
	};
}

export type CompetitionClock = Awaited<ReturnType<typeof createClock>>;
