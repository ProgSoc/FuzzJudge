<!-- 
This program is free software: you can redistribute it and/or modify it
under the terms of the GNU Lesser General Public License as published by the
Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful, but 
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License 
for more details.

You should have received a copy of the GNU Lesser General Public License along
with this program. If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
  import Client from "./lib/Client.svelte";
  import Loading from "./lib/Loading.svelte";
  import {
    CompState,
    get_current_comp_state,
    get_time_till_next_state,
    showing_questions,
    type CompTimes,
    type QuestionMeta,
  } from "./utils";
  import { get_questions, get_comp_info, get_comp_times } from "./api";
  import { onDestroy } from "svelte";

  let comp_times: CompTimes | undefined = undefined;
  let questions: Record<string, QuestionMeta> | undefined = undefined;
  let loading_errors: string[] = [];

  get_comp_info().then((data) => {
    window.document.title = data.title;
  });

  const load_questions = () => {
    get_questions()
      .then((q) => {
        questions = q;
      })
      .catch((err) => {
        loading_errors.push(err);
        loading_errors = loading_errors;
      });
  };

  let current_state: CompState | undefined = undefined;

  let timer_ref = -1;

  // Sets a timer to trigger a rerender to update the main content
  const set_timer_for_next_state = () => {
    if (comp_times == undefined) return;
    current_state = get_current_comp_state(comp_times);
    if (showing_questions(comp_times)) {
      load_questions();
    }
    console.log(`changed current state to ${current_state}`);

    timer_ref = setTimeout(
      () => {
        set_timer_for_next_state();
      },
      get_time_till_next_state(comp_times, current_state),
    );
  };

  onDestroy(() => clearTimeout(timer_ref));

  get_comp_times()
    .then((t) => {
      if (t === undefined) {
        load_questions();
        return;
      }

      console.log("got times");
      comp_times = t;
      if (showing_questions(t)) {
        load_questions();
      }
      set_timer_for_next_state();
    })
    .catch((err) => {
      loading_errors.push(err);
      loading_errors = loading_errors;
    });

  const set_solved = (slug: string) => {
    if (questions === undefined) return;

    questions[slug].solved = true;
  };

  // For hot reloading
  try {
    const socket = new WebSocket(`ws://localhost:25566`);

    socket.addEventListener("message", (event) => {
      window.location.reload();
    });
  } catch (e) {
    console.error("Failed to connect to hot-reloading socket: ", e);
  }
</script>

{#if questions !== undefined || (comp_times !== undefined && !showing_questions(comp_times))}
  <Client {questions} {set_solved} {comp_times} {current_state} />
{:else if loading_errors.length > 0}
  <div class="loading">
    Error loading questions:<br />
    {#each loading_errors as error}
      <code>{error}</code>
    {/each}
  </div>
{:else}
  <Loading />
{/if}
