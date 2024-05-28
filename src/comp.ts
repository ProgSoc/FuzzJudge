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

import { basename, dirname, pathJoin } from "./deps.ts";
import { FuzzJudgeDocument } from "./util.ts";


export class FuzzJudgeProblem {
  #doc: FuzzJudgeDocument;
  #configPath: string;
  #slug: string;
  #cmdFuzz: string;
  #cmdJudge: string;
  #argsFuzz: string[];
  #argsJudge: string[];

  constructor(configPath: string, doc: FuzzJudgeDocument) {
    this.#doc = doc;
    this.#configPath = configPath;
    this.#slug = basename(dirname(configPath));
    this.#cmdFuzz = Object(doc.config).fuzz?.exec?.[0] ?? pathJoin(configPath, "../fuzz");
    this.#cmdJudge = Object(doc.config).judge?.exec?.[0] ?? pathJoin(configPath, "../judge");
    this.#argsFuzz = Array.from(Object(doc.config).fuzz?.exec ?? []).map(String).slice(1);
    this.#argsJudge = Array.from(Object(doc.config).judge?.exec ?? []).map(String).slice(1);
  }

  slug(): string {
    return this.#slug;
  }

  doc(): FuzzJudgeDocument {
    return this.#doc;
  }

  async fuzz(seed: string): Promise<string> {
    const proc = new Deno.Command(this.#cmdFuzz, {
      args: [...this.#argsFuzz, seed],
      cwd: pathJoin(this.#configPath, ".."),
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    }).spawn();
    const out = await proc.output();
    if (!out.success) console.error(new TextDecoder().decode(out.stderr));
    return new TextDecoder().decode(out.stdout);
  }

  async judge(seed: string, input: string): Promise<{ correct: boolean; errors?: string }> {
    const proc = new Deno.Command(this.#cmdJudge, {
      args: [...this.#argsJudge, seed],
      cwd: pathJoin(this.#configPath, ".."),
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    }).spawn();
    await new Response(input).body?.pipeTo(proc.stdin);
    const out = await proc.output();
    const err = new TextDecoder().decode(out.stderr);
    
    if (out.success) return { correct: true };
    else return { correct: false, errors: err };
  }
}
