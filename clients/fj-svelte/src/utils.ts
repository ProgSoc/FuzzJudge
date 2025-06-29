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

import { type Writable, writable } from "svelte/store";
import type { ProblemsListQueryQuery } from "./gql";

export const selectedProblem: Writable<string> = writable("");

selectedProblem.subscribe((value) => {
	console.log("Selected problem changed:", value);
});

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

export function unreachable(x: never): never {
	throw new Error(`Unreachable code reached: ${x}`);
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

interface GenericProblem {
	difficulty: number;
	points: number;
	name: string;
}

export function problemOrder(a: GenericProblem, b: GenericProblem) {
	if (a.difficulty !== b.difficulty) {
		return a.difficulty - b.difficulty;
	}

	if (a.points !== b.points) {
		return a.points - b.points;
	}

	if (a.points !== b.points) {
		return a.points - b.points;
	}

	return a.name.localeCompare(b.name);
}

/**
 * Gets the slug of the next unsolved problem `offset` problems away from the
 * selected problem.
 */
// export function nextUnsolvedProblem(
// 	problems: ProblemsListQueryQuery["problems"],
// 	selected: string,
// 	offset = 1,
// ): string | null {
// 	const probs = problems.filter((p) => !p.solved).sort(problemOrder);

// 	const selectedIndex = probs.findIndex((p) => p.slug === selected);

// 	if (selectedIndex === -1) return null;

// 	let newIndex = (selectedIndex + offset) % probs.length;
// 	while (newIndex < 0) newIndex += probs.length;

// 	if (newIndex === selectedIndex) return null;

// 	return probs[newIndex].slug;
// }
