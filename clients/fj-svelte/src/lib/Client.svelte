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
  import {
    CompState,
    get_current_comp_state,
    get_time_till_next_state,
    showing_questions_at_current_time,
    type CompTimes,
    type QuestionMeta,
    selected_question,
  } from "../utils";
  import { get_questions, get_comp_info, get_comp_times } from "../api";
  import { onDestroy } from "svelte";
  import CompInfo from "./CompInfo.svelte";
  import Popout from "./Popout.svelte";
  import Sidebar from "./Sidebar.svelte";
  import Scoreboard from "./Scoreboard.svelte";
  import QuestionContents from "./QuestionContents.svelte";
  import Loading from "./Loading.svelte";

  import { get_username } from "../api";
  import Countdown from "./Countdown.svelte";

  let username = "Loading...";

  get_username().then((name) => {
    username = name;
  });

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

    if (showing_questions_at_current_time(comp_times)) {
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

      if (showing_questions_at_current_time(t)) {
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

  // FIXME
  $: !(questions !== undefined) || selected_question.set(
    Object.values(questions).find((q) => q.num === 1)?.slug ?? "",
  );

  enum ShowingPopout {
    None,
    Scoreboard,
    CompInfo,
  }

  let showing_popout: ShowingPopout = ShowingPopout.None;
</script>

<div class="layout">
  <div class="top-bar">
    <div>
      <button on:click={() => (showing_popout = ShowingPopout.CompInfo)}
        >Comp Info</button
      >
      <button on:click={() => (showing_popout = ShowingPopout.Scoreboard)}
        >Scoreboard</button
      >
      {#if comp_times !== undefined && (current_state === CompState.LIVE_WITH_SCORES || current_state === CompState.LIVE_WITHOUT_SCORES)}
        <span
          >Remaining: <Countdown
            {comp_times}
            until_state={CompState.FINISHED}
            show_binary={false}
          /></span
        >
      {/if}
    </div>
    <div>
      Logged in as <b>{username}</b>
      <a href="/auth" title="Enter empty credentials">Logout</a>
    </div>
  </div>

  <Sidebar {questions} />

  <!-- main content -->
  {#if comp_times !== undefined && (showing_questions_at_current_time(comp_times))}
    <QuestionContents
      question_data={questions[$selected_question]}
      {set_solved}
    />
  {:else if current_state == CompState.BEFORE}
    <div class="locked-message">
      <Countdown {comp_times} until_state={CompState.LIVE_WITH_SCORES} />
    </div>
  {:else if current_state == CompState.FINISHED}
    <div class="locked-message">
      <div class="finished-message">
        <h1>Competition Finished</h1>
        <p>You can no longer submit solutions.</p>
      </div>
    </div>
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
</div>

<Popout
  shown={showing_popout === ShowingPopout.Scoreboard}
  close={() => (showing_popout = ShowingPopout.None)}
>
  <Scoreboard {questions} />
</Popout>

<Popout
  shown={showing_popout === ShowingPopout.CompInfo}
  close={() => (showing_popout = ShowingPopout.None)}
>
  <CompInfo />
</Popout>

<style>
  .layout {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
    display: grid;
    grid-template-columns: min-content 1.7fr;
    grid-template-rows: 2rem 1.9fr;
    grid-auto-rows: 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      "top-bar top-bar"
      "question-list question-instructions";
  }

  .top-bar {
    grid-area: top-bar;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem;
    color: var(--text-sec);
    background-color: var(--bg-sec);
  }

  .locked-message {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    font-size: 1.5rem;
    color: var(--text-sec);
  }

  .finished-message {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
