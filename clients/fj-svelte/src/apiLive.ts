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

import type { SocketMessage } from "@progsoc/fuzzjudge-server/app";
import type { FuzzJudgeProblemMessage } from "@progsoc/fuzzjudge-server/dist/src/services/problems.service.ts";
import type { CompetitionClockMessage } from "@progsoc/fuzzjudge-server/v1/clock";
import type { CompetitionScoreboardMessage } from "@progsoc/fuzzjudge-server/v1/score";
import { onDestroy } from "svelte";
import { BACKEND_SERVER, client } from "./api.ts";
import { unreachable } from "./utils";

function makeSvelteSubscribable<T>() {
	const subscribers = new Set<(value: T) => void>();

	return {
		subscribe: (callback: (value: T) => void) => {
			subscribers.add(callback);

			const unsubscribe = () => {
				subscribers.delete(callback);
			};

			// Unsubscribe if the component is destroyed
			onDestroy(unsubscribe);

			// Return unsubscribe function if the client wants to manually unsubscribe
			return unsubscribe;
		},
		notify: (value: T) => {
			for (const callback of subscribers) {
				callback(value);
			}
		},
	};
}

export function listenOnWebsocket(callback: (data: SocketMessage) => void) {
	const wsUrl = client.ws.$url().toString().replace(/^http/, "ws");

	const ws = new WebSocket(wsUrl);
	ws.addEventListener("message", ({ data }) => {
		callback(JSON.parse(data));
	});
	ws.addEventListener("close", () =>
		setTimeout(() => listenOnWebsocket(callback), 1000),
	);
}

export function initLiveState() {
	const clockSubscribable = makeSvelteSubscribable<CompetitionClockMessage>();
	const problemsSubscribable =
		makeSvelteSubscribable<FuzzJudgeProblemMessage[]>();
	const scoreboardSubscribable =
		makeSvelteSubscribable<CompetitionScoreboardMessage>();

	listenOnWebsocket((data) => {
		console.log("Received data:", data);
		switch (data.kind) {
			case "clock": {
				const value = data.value;

				// Fix dates
				clockSubscribable.notify({
					finish: new Date(value.finish),
					hold: value.hold && new Date(value.hold),
					start: new Date(value.start),
				});
				break;
			}
			case "problems":
				problemsSubscribable.notify(data.value);
				break;
			case "scoreboard":
				scoreboardSubscribable.notify(data.value);
				break;
			default:
				unreachable(data);
		}
	});

	return {
		listenClock: clockSubscribable.subscribe,
		listenProblems: problemsSubscribable.subscribe,
		listenScoreboard: scoreboardSubscribable.subscribe,
	};
}

export type LiveState = ReturnType<typeof initLiveState>;
