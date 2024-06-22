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

interface TimeConfig {
  start: Date;
  freeze: Date;
  stop: Date;
}

export enum CompState {
  BEFORE, LIVE_WITH_SCORES, LIVE_WITHOUT_SCORES, FINISHED
}

const CONFIG_CACHE_REFRESH_MS = 1000;

export class Clock {
  // Cache the timing config in memory to prevent excessive database hits,
  // particularly when the comp starts and every connected client hits the questions endpoint at the same time
  #timing_config: TimeConfig | undefined = undefined;
  #timing_config_retrieved: Date = new Date();
  #game_name: string;

  constructor(game_name: string) {
    // TODO: ensure game exists in database
    this.#game_name = game_name;
    this.#load_times();
  }

  #load_times() {
    const time_since_retrieved =
      new Date().getTime() - this.#timing_config_retrieved.getTime();
    if (
      this.#timing_config == undefined ||
      time_since_retrieved > CONFIG_CACHE_REFRESH_MS
    ) {
      // will use a query like SELECT start_time, freeze_time, stop_time FROM CompetitionConfig WHERE name = ?;
      this.#timing_config_retrieved = new Date();
      this.#timing_config = {
        start: new Date(Date.now() + 30_000),
        freeze: new Date(Date.now() + 60_000),
        stop: new Date(Date.now() + 120_000),
      };
    }
  }

  times_json(): string {
    this.#load_times();
    return JSON.stringify(this.#timing_config);
  }

  set_times(content: string) {
    // TODO: parse times and call db
    console.log(`times ${content}`);
    // UPDATE Games SET start_time = ... WHERE name = ?;
  }

  protect(allowed_in: CompState[] = [CompState.LIVE_WITHOUT_SCORES, CompState.LIVE_WITH_SCORES]) {
    const comp_state = this.current_comp_state();
    if (comp_state == undefined || !allowed_in.includes(comp_state)) {
      throw new Response("503 Unavailable\n\nToo early or too late\n", {
        status: 503,
      });
    }
  }

  current_comp_state(): CompState | undefined {
    const now = new Date();
    if(this.#timing_config == undefined){
      return undefined;
    } else if(now < this.#timing_config.start) {
      return CompState.BEFORE;
    } else if (now < this.#timing_config.freeze) {
      return CompState.LIVE_WITH_SCORES;
    } else if (now < this.#timing_config.stop) {
      return CompState.LIVE_WITHOUT_SCORES;
    } else {
      return CompState.FINISHED;
    }
  }
}
