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

import type { FuzzJudgeProblemMessage } from "server/services/problems.service";
import { type Writable, writable } from "svelte/store";

export const selectedProblem: Writable<string> = writable("");

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

export function unreachable(x: never): never {
	throw new Error(`Unreachable code reached: ${x}`);
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

export function removeMdTitle(md: string): string {
	const lines = md.trim().split("\n");
	if (lines[0].startsWith("# ")) {
		lines.shift();
	}
	return lines.join("\n");
}

export function currentYear() {
	const date = new Date();
	return date.getFullYear();
}

export function problemOrder(
	a: FuzzJudgeProblemMessage,
	b: FuzzJudgeProblemMessage,
) {
	if (a.difficulty !== b.difficulty) {
		return a.difficulty - b.difficulty;
	}

	if (a.points !== b.points) {
		return a.points - b.points;
	}

	if (a.points !== b.points) {
		return a.points - b.points;
	}

	return a.doc.title.localeCompare(b.doc.title);
}

/**
 * Gets the slug of the next unsolved problem `offset` problems away from the
 * selected problem.
 */
export function nextUnsovledProblem(
	problems: Record<string, FuzzJudgeProblemMessage>,
	solvedProblems: Set<string>,
	selected: string,
	offset = 1,
): string | null {
	const probs = Object.values(problems)
		.filter((p) => !solvedProblems.has(p.slug))
		.sort(problemOrder);

	const selectedIndex = probs.findIndex((p) => p.slug === selected);

	if (selectedIndex === -1) return null;

	let newIndex = (selectedIndex + offset) % probs.length;
	while (newIndex < 0) newIndex += probs.length;

	if (newIndex === selectedIndex) return null;

	return probs[newIndex].slug;
}
