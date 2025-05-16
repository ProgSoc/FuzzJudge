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
// import { hc } from "@progsoc/fuzzjudge-server/src/client";
import { showNotification } from "./notifications";
import { type ScoreboardUser, exists, parseScoreboard } from "./utils";

export const BACKEND_SERVER: string = import.meta.env.VITE_BACKEND_URL || "";
// export const client = hc(BACKEND_SERVER);

console.log("Backend server URL:", BACKEND_SERVER);

export interface ScoreboardEvent {
	new_scoreboard: ScoreboardUser[];
}

export const subscribeToScoreboard = (
	callback: (data: ScoreboardEvent) => void,
): (() => void) => {
	try {
		const wsURL = `${BACKEND_SERVER.replace(/^http/, "ws")}`;

		console.log("Connecting to scoreboard websocket at", wsURL);

		const socket = new WebSocket(wsURL);

		socket.addEventListener("message", (event) => {
			callback({ new_scoreboard: parseScoreboard(event.data) });
		});

		return () => {
			socket.close();
		};
	} catch (error) {
		console.error("Error subscribing to scoreboard:", error);

		return () => {};
	}
};

export const getCompInfo = async (): Promise<{
	title: string;
	instructions: string;
}> => {
	const title = await (await fetch(`${BACKEND_SERVER}/comp/name`)).text();
	const instructions = await (
		await fetch(`${BACKEND_SERVER}/comp/instructions`)
	).text();
	return { title, instructions };
};

export const getScoreboard = async (): Promise<ScoreboardUser[]> => {
	return parseScoreboard(
		await (await fetch(`${BACKEND_SERVER}/comp/scoreboard`)).text(),
	);
};

export const getUsername = async (): Promise<string> => {
	return await fetch(`${BACKEND_SERVER}/auth`).then((r) => r.text());
};

export const submitSolution = async (
	slug: string,
	output: string,
	source: string,
): Promise<{ correct: boolean; message: string }> => {
	const res = await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/judge`, {
		method: "POST",
		body: new URLSearchParams({
			output,
			source,
		}),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	});

	return {
		correct: res.ok,
		message: await res.text(),
	};
};

function fuzzUrl(slug: string) {
	return `${BACKEND_SERVER}/comp/prob/${slug}/fuzz`;
}

export function openFuzz(slug: string) {
	window.open(fuzzUrl(slug), "_blank");
}

export function downloadFuzz(slug: string) {
	const link = document.createElement("a");
	link.style.display = "none";
	link.href = fuzzUrl(slug);
	link.download = `${slug}.txt`;
	document.body.appendChild(link);
	link.click();
	setTimeout(() => {
		URL.revokeObjectURL(link.href);
		if (link.parentNode) {
			link.parentNode.removeChild(link);
		}
	}, 0);
}

export function copyFuzz(slug: string) {
	(async () => {
		const url = fuzzUrl(slug);
		const text = await (await fetch(url)).text();
		await navigator.clipboard.writeText(text);
		showNotification("Copied problem input to clipboard");
	})();
}

export async function isProblemSolved(slug: string) {
	const res = await fetch(`${BACKEND_SERVER}/comp/prob/${slug}/judge`, {
		method: "GET",
	});

	const text = await res.text();
	return text === "OK";
}

export async function getProblemSolvedSet(problemSlugs: string[]) {
	const remainingSolved = await Promise.all(
		problemSlugs.map(async (slug) => {
			if (await isProblemSolved(slug)) {
				return slug;
			}
			return null;
		}),
	);

	return new Set(remainingSolved.filter(exists));
}
