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

import { TextLineStream } from "https://deno.land/std@0.223.0/streams/mod.ts";

import { fuzz } from "./fuzz.ts";

if (import.meta.main) {
	const names = fuzz(Deno.args[0] ?? "");

	for await (const line of Deno.stdin.readable
		.pipeThrough(new TextDecoderStream())
		.pipeThrough(new TextLineStream())) {
		if (names.length === 0) {
			console.error("Received too many lines");
			Deno.exit(1);
		}

		const expected = `Goodbye, ${names.shift()}!`;

		if (line !== expected) {
			console.error(`Expected "${expected}", got "${line}"`);
			Deno.exit(1);
		}
	}

	if (names.length > 0) {
		console.error(`Expected more lines, got ${names.length} less`);
		Deno.exit(1);
	}

	Deno.exit(0);
}
