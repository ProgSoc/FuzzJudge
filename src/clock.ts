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

import { CompetitionDB } from "./db.ts";
import { Subscribable } from "./util.ts";

export type ClockState =
  | "live"
  | "hold"
  | "stop"
;

export class CompetitionClock extends Subscribable<CompetitionClock> {
  #db: CompetitionDB;
  #state: ClockState = "hold";
  #start: Date;
  #finish: Date;
  #hold: Date | null;

  constructor(opts: { db: CompetitionDB, plannedStart: Date, plannedFinish: Date }) {
    super();
    this.#db = opts.db;
    this.#start = new Date(this.#db.getOrSetDefaultMeta("clock_start", opts.plannedStart.toJSON()));
    this.#finish = new Date(this.#db.getOrSetDefaultMeta("clock_finish", opts.plannedFinish.toJSON()));
    this.#hold = null;
  }

  protect(allowWhen: Iterable<ClockState>): void | never {
    const allowedStates = new Set(allowWhen);
    if (!allowedStates.has(this.#state)) {
      let message = "";
      switch (this.#state) {
        case "hold": message = "Clock on hold.\n"; break;
        case "live": message = "Clock is live.\n"; break;
        case "stop": message = "Clock is stopped.\n"; break;
      }
      throw new Response(`503 Unavailable\n\n${message}`, { status: 503 })
    }
  }

  now() {
    return {
      start: this.#start,
      finish: this.#finish,
      hold: this.#hold,
    };
  }

  adjustStart(time: Date, { keepDuration = false }) {
    const delta = this.#start.getTime() - time.getTime();
    this.#start = time;
    if (keepDuration) this.#finish = new Date(this.#finish.getTime() - delta);
    this.notify(this);
  }

  adjustFinish(timeOrMinutesDuration: Date | number) {
    let newFinish: Date;
    if (typeof timeOrMinutesDuration === "number") {
      const duration = timeOrMinutesDuration;
      newFinish = new Date(this.#start.getTime() + duration * 60_000);
    } else {
      newFinish = timeOrMinutesDuration;
    }
    if (newFinish < this.#start) throw new RangeError("Finish time must be after start.");
    this.notify(this);
  }

  hold() {
    this.#hold = new Date();
    this.notify(this);
  }

  release({ extendDuration = false }) {
    if (this.#hold === null) return;
    const delta = this.#hold.getTime() - Date.now();
    if (extendDuration) this.#finish = new Date(this.#finish.getTime() - delta);
    this.#hold = null;
    this.notify(this);
  }
}
