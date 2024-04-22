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
import { makeSeededGenerators } from "https://deno.land/x/vegas@v1.3.0/mod.ts";

const names = [
  "Linus",
  "Theo",
  "Guido",
  "Graydon",
  "Jake",
  "Ada",
  "Margaret",
  "Lisa",
  "Justine",
];

if (import.meta.main) {
  if (Deno.args[0] == "fuzz") {
    const rand = makeSeededGenerators(Deno.args[1] || "");
    for (const sample of rand.randomSample(names, 5)) {
      console.log(sample);
    }
  }
  else if (Deno.args[0] == "solve") {
    for await (
      const line of Deno.stdin.readable
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new TextLineStream())
    ) {
      console.log(solve(line));
    }
  }
}

function solve(line: string): string {
  return `Hello, ${line}!`;
}
