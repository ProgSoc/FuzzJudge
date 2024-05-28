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

export function fuzz(seed: string): string[] {
  const rand = makeSeededGenerators(seed);
  return rand.randomSample(names, 5);
}

if (import.meta.main) {
  for (const sample of fuzz(Deno.args[0] ?? "")) {
    console.log(sample);
  }
}
