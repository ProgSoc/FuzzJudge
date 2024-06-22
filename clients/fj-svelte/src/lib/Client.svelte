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
  import CompInfo from "./CompInfo.svelte";
  import Popout from "./Popout.svelte";
  import Sidebar from "./Sidebar.svelte";
  import Scoreboard from "./Scoreboard.svelte";
  import QuestionContents from "./QuestionContents.svelte";
  import {
    type QuestionMeta,
    selected_question,
    type CompTimes,
    CompState,
  } from "../utils";

  import { get_username } from "../api";
  import Countdown from "./Countdown.svelte";

  let username = "Loading...";

  get_username().then((name) => {
    username = name;
  });

  export let comp_times: CompTimes | undefined = undefined;
  export let current_state: CompState | undefined = undefined; // can be infered from comp_times but is passed in to make it reactive
  export let questions: Record<string, QuestionMeta> = {};
  export let set_solved: (slug: string) => void;

  $: selected_question.set(
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
  {#if comp_times === undefined || (current_state === CompState.LIVE_WITH_SCORES || current_state === CompState.LIVE_WITHOUT_SCORES)}
    <QuestionContents
      question_data={questions[$selected_question]}
      {set_solved}
    />
  {:else if current_state == CompState.BEFORE}
    <div class="locked-message">
      <Countdown {comp_times} until_state={CompState.LIVE_WITH_SCORES} />
    </div>
  {:else}
    <div class="locked-message">
      <h1>Finished</h1>
    </div>
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
</style>
